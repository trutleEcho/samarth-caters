import {EmployeeType} from "@/data/enums/employee-type";

export interface Employee {
    id: string // UUID
    name: string
    phone_number?: string
    address?: string
    employee_type: EmployeeType
    created_at: Date
}