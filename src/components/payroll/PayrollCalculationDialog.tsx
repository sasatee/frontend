import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useCategoryGroups } from '@/hooks/useCategoryGroups';
import { useEmployees } from '@/hooks/useEmployees';
import { usePayrollCalculation } from '@/hooks/usePayrollCalculation';
import { PayrollCalculationRequest } from '@/services/payrollService';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building, Calculator, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

// Schema for payroll calculation form
const payrollCalculationSchema = z.object({
    employeeId: z.string().min(1, 'Employee is required'),
    categoryGroupId: z.string().min(1, 'Category group is required'),
});

type PayrollCalculationFormData = z.infer<typeof payrollCalculationSchema>;

interface PayrollCalculationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function PayrollCalculationDialog({ open, onOpenChange }: PayrollCalculationDialogProps) {
    const { data: employees, isLoading: isLoadingEmployees } = useEmployees();
    const { data: categoryGroups, isLoading: isLoadingCategoryGroups } = useCategoryGroups();
    const { calculatePayroll, isCalculating } = usePayrollCalculation();
    const [selectedEmployee, setSelectedEmployee] = useState<string>('');

    const form = useForm<PayrollCalculationFormData>({
        resolver: zodResolver(payrollCalculationSchema),
        defaultValues: {
            employeeId: '',
            categoryGroupId: '',
        },
    });

    // Reset form when dialog opens/closes
    useEffect(() => {
        if (!open) {
            form.reset();
            setSelectedEmployee('');
        }
    }, [open, form]);

    // Watch employee selection to auto-populate category group
    const watchEmployeeId = form.watch('employeeId');
    useEffect(() => {
        if (watchEmployeeId && employees) {
            const employee = employees.find((e) => e.id === watchEmployeeId);
            if (employee && employee.categoryGroupId) {
                form.setValue('categoryGroupId', employee.categoryGroupId);
                setSelectedEmployee(employee.id);
            }
        }
    }, [watchEmployeeId, employees, form]);

    const handleSubmit = async (data: PayrollCalculationFormData) => {
        try {
            const calculationRequest: PayrollCalculationRequest = {
                employeeId: data.employeeId,
                categoryGroupId: data.categoryGroupId,
            };

            await calculatePayroll(calculationRequest);
            onOpenChange(false);
            form.reset();
        } catch (error) {
            // Error handling is done in the hook
            console.error('Payroll calculation error:', error);
        }
    };

    if (isLoadingEmployees || isLoadingCategoryGroups) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent>
                    <div className="flex items-center justify-center py-8">
                        <LoadingSpinner size="lg" />
                        <span className="ml-2">Loading employee and category data...</span>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Calculator className="h-5 w-5" />
                        Calculate Employee Payroll
                    </DialogTitle>
                    <DialogDescription>
                        Calculate payroll for a specific employee based on their category group, allowances, and deductions.
                        This will generate a new payroll record with calculated basic salary, allowances, deductions, and net pay.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                        <Alert>
                            <Calculator className="h-4 w-4" />
                            <AlertDescription>
                                <strong>Admin Function:</strong> This action will calculate payroll based on the employee's
                                category group, years of service, and current allowances/deductions.
                            </AlertDescription>
                        </Alert>

                        <FormField
                            control={form.control}
                            name="employeeId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        Select Employee
                                    </FormLabel>
                                    <Select
                                        value={field.value}
                                        onValueChange={(value) => {
                                            field.onChange(value);
                                            setSelectedEmployee(value);
                                        }}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Choose an employee to calculate payroll for" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {employees
                                                ?.filter((employee) => employee.id && employee.id !== '')
                                                .map((employee) => (
                                                    <SelectItem key={employee.id} value={employee.id}>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">
                                                                {employee.firstName} {employee.lastName}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {employee.jobTitle} • {employee.department?.name || 'Unknown Department'}
                                                            </span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="categoryGroupId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2">
                                        <Building className="h-4 w-4" />
                                        Category Group
                                    </FormLabel>
                                    <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                        disabled={!selectedEmployee}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Category group will be auto-selected based on employee" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {categoryGroups
                                                ?.filter((group) => group.id && group.id !== '')
                                                .map((group) => (
                                                    <SelectItem key={group.id} value={group.id}>
                                                        {group.name}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                    {selectedEmployee && (
                                        <p className="text-xs text-muted-foreground">
                                            Category group is automatically set based on the selected employee's profile.
                                        </p>
                                    )}
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end space-x-2 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isCalculating}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isCalculating}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                {isCalculating ? (
                                    <>
                                        <LoadingSpinner size="sm" className="mr-2" />
                                        Calculating...
                                    </>
                                ) : (
                                    <>
                                        <Calculator className="mr-2 h-4 w-4" />
                                        Calculate Payroll
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
} 