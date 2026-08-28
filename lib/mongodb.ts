import mongoose, { type Connection } from "mongoose";
import { after } from "next/server";
import Agent from "@/models/Agent";
import Category from "@/models/Category";
import Employee from "@/models/Employee";
import Expenditure from "@/models/Expenditure";
import Income from "@/models/Income";
import MonthlyCollection from "@/models/MonthlyCollection";
import MonthlyTenant from "@/models/MonthlyTenant";
import OtherBrokerage from "@/models/OtherBrokerage";
import PaymentState from "@/models/PaymentState";
import PayrollRun from "@/models/PayrollRun";
import PayrollSetting from "@/models/PayrollSetting";
import Reconciliation from "@/models/Reconciliation";
import Solicitor from "@/models/Solicitor";
import Trade from "@/models/Trade";
import User from "@/models/User";

function modelForConnection<T>(
  connection: Connection,
  source: { modelName: string; schema: unknown }
): T {
  const existing = connection.models[source.modelName];
  if (existing) return existing as unknown as T;

  return connection.model(
    source.modelName,
    source.schema as mongoose.Schema
  ) as unknown as T;
}

export type DatabaseModels = {
  Agent: typeof Agent;
  Category: typeof Category;
  Employee: typeof Employee;
  Expenditure: typeof Expenditure;
  Income: typeof Income;
  MonthlyCollection: typeof MonthlyCollection;
  MonthlyTenant: typeof MonthlyTenant;
  OtherBrokerage: typeof OtherBrokerage;
  PaymentState: typeof PaymentState;
  PayrollRun: typeof PayrollRun;
  PayrollSetting: typeof PayrollSetting;
  Reconciliation: typeof Reconciliation;
  Solicitor: typeof Solicitor;
  Trade: typeof Trade;
  User: typeof User;
};

/**
 * Opens a MongoDB connection that belongs to the current request only.
 *
 * Cloudflare Workers do not permit TCP sockets to be shared between requests,
 * so this deliberately does not cache a Mongoose connection on globalThis.
 */
export async function connectToDatabase(): Promise<DatabaseModels> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is missing.");
  }

  const connection = await mongoose
    .createConnection(uri, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10_000,
      connectTimeoutMS: 10_000,
      waitQueueTimeoutMS: 10_000,
      maxPoolSize: 1,
      minPoolSize: 0,
    })
    .asPromise();

  // Route Handlers run this callback after the response, so the TCP socket is
  // never retained by a reused Worker isolate.
  after(async () => {
    try {
      await connection.close();
    } catch (error) {
      console.error("Error closing MongoDB connection:", error);
    }
  });

  return {
    Agent: modelForConnection(connection, Agent),
    Category: modelForConnection(connection, Category),
    Employee: modelForConnection(connection, Employee),
    Expenditure: modelForConnection(connection, Expenditure),
    Income: modelForConnection(connection, Income),
    MonthlyCollection: modelForConnection(connection, MonthlyCollection),
    MonthlyTenant: modelForConnection(connection, MonthlyTenant),
    OtherBrokerage: modelForConnection(connection, OtherBrokerage),
    PaymentState: modelForConnection(connection, PaymentState),
    PayrollRun: modelForConnection(connection, PayrollRun),
    PayrollSetting: modelForConnection(connection, PayrollSetting),
    Reconciliation: modelForConnection(connection, Reconciliation),
    Solicitor: modelForConnection(connection, Solicitor),
    Trade: modelForConnection(connection, Trade),
    User: modelForConnection(connection, User),
  };
}
