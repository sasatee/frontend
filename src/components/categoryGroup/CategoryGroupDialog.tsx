import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
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
import { Input } from '@/components/ui/input';
import { CategoryGroup } from '@/types/categoryGroup';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
  name: z
    .string()
    .min(2, 'Category group name must be at least 2 characters')
    .max(100, 'Category group name cannot exceed 100 characters')
    .regex(
      /^[a-zA-Z0-9\s\-_:.()]+$/,
      'Category group name can only contain letters, numbers, spaces, hyphens, underscores, colons, dots, and parentheses'
    )
    .transform((val) => val.trim()),
});

type FormValues = z.infer<typeof formSchema>;

interface CategoryGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryGroup?: CategoryGroup | null;
  onSubmit: (data: FormValues) => void;
  isLoading?: boolean;
}

export function CategoryGroupDialog({
  open,
  onOpenChange,
  categoryGroup,
  onSubmit,
  isLoading = false,
}: CategoryGroupDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
    },
  });

  useEffect(() => {
    if (categoryGroup) {
      form.reset({
        name: categoryGroup.name,
      });
    } else {
      form.reset({
        name: '',
      });
    }
  }, [categoryGroup, form]);

  const handleSubmit = (data: FormValues) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{categoryGroup ? 'Edit Category Group' : 'Add Category Group'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter category group name"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : categoryGroup ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
