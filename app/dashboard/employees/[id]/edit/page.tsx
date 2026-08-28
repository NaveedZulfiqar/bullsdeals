import EmployeeForm from "@/components/employees/EmployeeForm";

export default async function EditEmployeePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EmployeeForm employeeId={id} />;
}
