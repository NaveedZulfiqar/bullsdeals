module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[project]/models/User.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "User",
    ()=>User,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__ = __turbopack_context__.i("[externals]/mongoose [external] (mongoose, cjs, [project]/node_modules/mongoose)");
;
const UserSchema = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["Schema"]({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        default: "Sid"
    },
    role: {
        type: String,
        default: "admin"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
const User = __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["models"].User || (0, __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["model"])("User", UserSchema);
const __TURBOPACK__default__export__ = User;
}),
"[project]/lib/mongodb.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "connectToDatabase",
    ()=>connectToDatabase
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__ = __turbopack_context__.i("[externals]/mongoose [external] (mongoose, cjs, [project]/node_modules/mongoose)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/bcryptjs/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$User$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/models/User.ts [app-route] (ecmascript)");
;
;
;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/bullsdeals";
// Prevent TypeScript global context issues in dev mode
let cached = /*TURBOPACK member replacement*/ __turbopack_context__.g.mongoose;
if (!cached) {
    cached = /*TURBOPACK member replacement*/ __turbopack_context__.g.mongoose = {
        conn: null,
        promise: null
    };
}
async function connectToDatabase() {
    if (cached.conn) {
        return cached.conn;
    }
    if (!cached.promise) {
        const opts = {
            bufferCommands: false
        };
        cached.promise = __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["default"].connect(MONGODB_URI, opts).then(async (m)=>{
            console.log("MongoDB connected successfully");
            // Seed default admin user
            await seedDefaultAdmin();
            return m;
        });
    }
    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }
    return cached.conn;
}
async function seedDefaultAdmin() {
    try {
        const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || "admin@bullsdeal.com";
        const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || "Changeme1234!@";
        const existingAdmin = await __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$User$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].findOne({
            email: adminEmail.toLowerCase()
        });
        if (!existingAdmin) {
            console.log("No default admin user found. Creating one...");
            const hashedPassword = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].hash(adminPassword, 10);
            await __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$User$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].create({
                email: adminEmail.toLowerCase(),
                password: hashedPassword,
                name: "Sid",
                role: "admin"
            });
            console.log(`Default admin user created: ${adminEmail}`);
        } else {
            console.log("Default admin user already exists");
        }
    } catch (error) {
        console.error("Error seeding default admin user:", error);
    }
}
}),
"[project]/models/Agent.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Agent",
    ()=>Agent,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__ = __turbopack_context__.i("[externals]/mongoose [external] (mongoose, cjs, [project]/node_modules/mongoose)");
;
const AgentSchema = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["Schema"]({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    middleName: {
        type: String,
        trim: true,
        default: ""
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    officeNickName: {
        type: String,
        trim: true,
        default: ""
    },
    tradeName: {
        type: String,
        trim: true,
        default: ""
    },
    dateOfBirth: {
        type: Date,
        default: null
    },
    hst: {
        type: String,
        trim: true,
        default: ""
    },
    sin: {
        type: String,
        trim: true,
        default: ""
    },
    street: {
        type: String,
        trim: true,
        default: ""
    },
    city: {
        type: String,
        trim: true,
        default: ""
    },
    province: {
        type: String,
        trim: true,
        default: "ONT"
    },
    postalCode: {
        type: String,
        trim: true,
        default: ""
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    cellPhone: {
        type: String,
        trim: true,
        default: ""
    },
    homePhone: {
        type: String,
        trim: true,
        default: ""
    },
    website: {
        type: String,
        trim: true,
        default: ""
    },
    agentType: {
        type: String,
        required: true,
        enum: [
            "Agent",
            "Broker"
        ],
        default: "Agent"
    },
    agentMentor: {
        type: String,
        trim: true,
        default: ""
    },
    payToPrec: {
        type: Boolean,
        default: false
    },
    addressIsSameAsAbove: {
        type: Boolean,
        default: false
    },
    precName: {
        type: String,
        trim: true,
        default: ""
    },
    precStreet: {
        type: String,
        trim: true,
        default: ""
    },
    precCity: {
        type: String,
        trim: true,
        default: ""
    },
    precProvince: {
        type: String,
        trim: true,
        default: "ONT"
    },
    precPostalCode: {
        type: String,
        trim: true,
        default: ""
    },
    precHst: {
        type: String,
        trim: true,
        default: ""
    },
    precBusinessNumber: {
        type: String,
        trim: true,
        default: ""
    },
    photo: {
        type: String,
        default: ""
    },
    recoNumber: {
        type: String,
        trim: true,
        default: ""
    },
    recoLicExpiry: {
        type: Date,
        default: null
    },
    agentCode: {
        type: String,
        trim: true,
        default: ""
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});
const Agent = __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["models"].Agent || (0, __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["model"])("Agent", AgentSchema);
const __TURBOPACK__default__export__ = Agent;
}),
"[project]/app/api/agents/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$mongodb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/mongodb.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$Agent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/models/Agent.ts [app-route] (ecmascript)");
;
;
;
async function GET(request) {
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$mongodb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["connectToDatabase"])();
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search") || "";
        const sortField = searchParams.get("sortField") || "firstName";
        const sortOrder = searchParams.get("sortOrder") || "asc";
        const showInactive = searchParams.get("showInactive") === "true";
        const precAgents = searchParams.get("precAgents") === "true";
        // Column-specific filters
        const filterName = searchParams.get("filterName") || "";
        const filterAddress = searchParams.get("filterAddress") || "";
        const filterTradeName = searchParams.get("filterTradeName") || "";
        const filterPhone = searchParams.get("filterPhone") || "";
        const filterEmail = searchParams.get("filterEmail") || "";
        const filterPrecName = searchParams.get("filterPrecName") || "";
        const filterReco = searchParams.get("filterReco") || "";
        const filterRecoExpiry = searchParams.get("filterRecoExpiry") || "";
        const filterAgentCode = searchParams.get("filterAgentCode") || "";
        // Build query
        const query = {};
        if (!showInactive) {
            query.isActive = true;
        }
        if (precAgents) {
            query.precName = {
                $nin: [
                    "",
                    null
                ]
            };
        }
        // Global search
        if (search) {
            query.$or = [
                {
                    firstName: {
                        $regex: search,
                        $options: "i"
                    }
                },
                {
                    lastName: {
                        $regex: search,
                        $options: "i"
                    }
                },
                {
                    email: {
                        $regex: search,
                        $options: "i"
                    }
                },
                {
                    cellPhone: {
                        $regex: search,
                        $options: "i"
                    }
                },
                {
                    tradeName: {
                        $regex: search,
                        $options: "i"
                    }
                },
                {
                    recoNumber: {
                        $regex: search,
                        $options: "i"
                    }
                },
                {
                    agentCode: {
                        $regex: search,
                        $options: "i"
                    }
                }
            ];
        }
        // Column filters
        if (filterName) {
            query.$and = query.$and || [];
            query.$and.push({
                $or: [
                    {
                        firstName: {
                            $regex: filterName,
                            $options: "i"
                        }
                    },
                    {
                        lastName: {
                            $regex: filterName,
                            $options: "i"
                        }
                    }
                ]
            });
        }
        if (filterAddress) {
            query.$and = query.$and || [];
            query.$and.push({
                $or: [
                    {
                        street: {
                            $regex: filterAddress,
                            $options: "i"
                        }
                    },
                    {
                        city: {
                            $regex: filterAddress,
                            $options: "i"
                        }
                    },
                    {
                        province: {
                            $regex: filterAddress,
                            $options: "i"
                        }
                    }
                ]
            });
        }
        if (filterTradeName) {
            query.tradeName = {
                $regex: filterTradeName,
                $options: "i"
            };
        }
        if (filterPhone) {
            query.cellPhone = {
                $regex: filterPhone,
                $options: "i"
            };
        }
        if (filterEmail) {
            query.email = {
                $regex: filterEmail,
                $options: "i"
            };
        }
        if (filterPrecName) {
            query.precName = {
                $regex: filterPrecName,
                $options: "i"
            };
        }
        if (filterReco) {
            query.recoNumber = {
                $regex: filterReco,
                $options: "i"
            };
        }
        if (filterAgentCode) {
            query.agentCode = {
                $regex: filterAgentCode,
                $options: "i"
            };
        }
        // Sort
        const sortObj = {};
        sortObj[sortField] = sortOrder === "asc" ? 1 : -1;
        const agents = await __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$Agent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].find(query).sort(sortObj).lean();
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            agents
        }, {
            status: 200
        });
    } catch (error) {
        console.error("Error fetching agents:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to fetch agents"
        }, {
            status: 500
        });
    }
}
async function POST(request) {
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$mongodb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["connectToDatabase"])();
        const body = await request.json();
        const agent = await __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$Agent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].create(body);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            agent
        }, {
            status: 201
        });
    } catch (error) {
        console.error("Error creating agent:", error);
        if (error.name === "ValidationError") {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: error.message
            }, {
                status: 400
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to create agent"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1flobm9._.js.map