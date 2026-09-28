import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Input,
    Select,
    SelectItem,
    Textarea,
    type Selection,
} from "@heroui/react";
import { useState, useEffect, type ReactNode, useMemo } from "react";


export type FieldType = 'text' | 'password' | 'number' | 'email' | 'select' | 'textarea' | 'date';

export interface SelectOption {
    value: string;
    label: string;
}

export interface FormField {
    renderValue?: any;
    name: string;
    label: string;
    type?: FieldType;
    placeholder?: string;
    options?: SelectOption[];
    multiple?: boolean;
    colSpan?: 1 | 2;
    required?: boolean;
    startContent?: ReactNode;
    endContent?: ReactNode;
    description?: string;
    className?: string;
    group?: string;
    disabled?: boolean;
    rows?: number;
    validation?: ValidationRule;
}

export interface ValidationRule {
    required?: string | boolean;
    minLength?: { value: number; message: string };
    maxLength?: { value: number; message: string };
    pattern?: { value: RegExp; message: string };
    min?: { value: number; message: string };
    max?: { value: number; message: string };
    validate?: (value: any) => boolean | string;
}

export interface FormGroup {
    title: string;
    icon?: ReactNode;
    description?: string;
    fields: string[];
}

export interface ModalComponentProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    fields: FormField[];
    groups?: FormGroup[];
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | 'xs' | '3xl' | '4xl' | '5xl';
    initialValues?: Record<string, any>;
    onSubmit: (data: Record<string, any>) => Promise<void>;
    children?: ReactNode;
    submitLabel?: string;
    cancelLabel?: string;
    isLoading?: boolean;
}


interface RenderFieldProps {
    field: FormField;
    form: Record<string, any>;
    handleChange: (key: string, value: any) => void;
    errors: Record<string, string>;
}

const renderField = ({ field, form, handleChange, errors }: RenderFieldProps) => {
    switch (field.type) {
        case "select":
            return (
                <Select
                    key={field.name}
                    label={field.label}
                    renderValue={
                        field.renderValue
                            ? (items) => {
                                const sel = items[0];
                                return field.renderValue!(
                                    String(sel?.key ?? ""),
                                    String(sel?.textValue ?? "")
                                );
                            }
                            : undefined
                    }
                    placeholder={field.placeholder}
                    isInvalid={!!errors[field.name]}
                    errorMessage={errors[field.name]}
                    selectionMode={field.multiple ? "multiple" : "single"}
                    selectedKeys={
                        field.multiple
                            ? new Set(form[field.name] || [])
                            : form[field.name]
                                ? new Set([form[field.name]])
                                : new Set()
                    }
                    onSelectionChange={(keys: Selection) => {
                        const values = Array.from(keys as Set<string>);
                        handleChange(
                            field.name,
                            field.multiple ? values : values[0]
                        );
                    }}
                    isRequired={field.required}
                    description={field.description}
                    className={field.className}
                    startContent={field.startContent}
                    endContent={field.endContent}
                >
                    {(field.options || []).map((opt) => (
                        <SelectItem key={opt.value}>
                            {opt.label}
                        </SelectItem>
                    ))}
                </Select>
            );

        case "textarea":
            return (
                <Textarea
                    key={field.name}
                    label={field.label}
                    placeholder={field.placeholder}
                    value={form[field.name] || ""}
                    onValueChange={(val) => handleChange(field.name, val)}
                    isInvalid={!!errors[field.name]}
                    errorMessage={errors[field.name]}
                    isRequired={field.required}
                    description={field.description}
                    className={field.className}
                    startContent={field.startContent}
                    endContent={field.endContent}
                    rows={field.rows || 3}
                />
            );

        case "number":
            return (
                <Input
                    key={field.name}
                    label={field.label}
                    placeholder={field.placeholder}
                    value={form[field.name]?.toString() || ""}
                    onValueChange={(val) => {
                        const num = val === "" ? undefined : Number(val);
                        handleChange(field.name, num);
                    }}
                    type="number"
                    isInvalid={!!errors[field.name]}
                    errorMessage={errors[field.name]}
                    isRequired={field.required}
                    description={field.description}
                    className={field.className}
                    startContent={field.startContent}
                    endContent={field.endContent}
                />
            );

        case "date":
            return (
                <Input
                    key={field.name}
                    label={field.label}
                    placeholder={field.placeholder}
                    value={form[field.name] || ""}
                    onValueChange={(val) => handleChange(field.name, val)}
                    type="date"
                    isInvalid={!!errors[field.name]}
                    errorMessage={errors[field.name]}
                    isRequired={field.required}
                    description={field.description}
                    className={field.className}
                    startContent={field.startContent}
                    endContent={field.endContent}
                />
            );

        default:
            return (
                <Input
                    key={field.name}
                    label={field.label}
                    placeholder={field.placeholder}
                    value={form[field.name] || ""}
                    onValueChange={(val) => handleChange(field.name, val)}
                    type={field.type || "text"}
                    isInvalid={!!errors[field.name]}
                    errorMessage={errors[field.name]}
                    autoComplete={field.type === "password" ? "new-password" : "on"}
                    isRequired={field.required}
                    description={field.description}
                    className={field.className}
                    startContent={field.startContent}
                    endContent={field.endContent}
                />
            );
    }
};


export default function ModalComponent({
    isOpen,
    onOpenChange,
    title = "Formulario",
    fields = [],
    groups = [],
    size = "md",
    initialValues = {},
    onSubmit,
    children,
    submitLabel = "Guardar",
    cancelLabel = "Cancelar",
    isLoading = false,
}: ModalComponentProps) {
    const [form, setForm] = useState<Record<string, any>>({});
    const [errors, setErrors] = useState<Record<string, string | undefined>>({});

    useEffect(() => {
        setForm(initialValues);
    }, [initialValues]);

    const handleChange = (key: string, value: any) => {
        setForm((prev) => ({ ...prev, [key]: value }));

        setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[key];
            return newErrors;
        });
    };

    const handleSubmit = async () => {

        const formattedForm = { ...form };

        fields.forEach(field => {
            if (field.type === 'date' && formattedForm[field.name]) {
                const dateValue = formattedForm[field.name];
                if (typeof dateValue === 'string' && dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
                    formattedForm[field.name] = new Date(dateValue + 'T00:00:00.000Z').toISOString();
                }
            }
        });
        try {
            await onSubmit(formattedForm);
            onOpenChange(false);
            setErrors({});
        } catch (err: any) {
            const validacionesDeCampos =
                err?.errors ||
                err?.fields ||
                err?.response?.data?.errors ||
                err?.response?.data?.fields ||
                {};

            if (Object.keys(validacionesDeCampos).length > 0) {
                setErrors(validacionesDeCampos);
            } else {
                const errorMessage = err?.message || "Ocurrió un error al guardar";
                console.error(errorMessage);
            }
        }
    };

    const handleClose = () => {
        setErrors({});
        onOpenChange(false);
    };

    const groupedFields = useMemo(() => {
        if (groups.length === 0) {
            return { ungrouped: fields };
        }

        const result: Record<string, FormField[]> = {
            ungrouped: [],
        };

        groups.forEach(group => {
            result[group.title] = [];
        });

        fields.forEach(field => {
            if (field.group) {
                const group = groups.find(g => g.title === field.group);
                if (group) {
                    result[group.title].push(field);
                } else {
                    result.ungrouped.push(field);
                }
            } else {
                result.ungrouped.push(field);
            }
        });

        return result;
    }, [fields, groups]);
    const renderGroup = (group: FormGroup, groupFields: FormField[]) => {
        if (groupFields.length === 0) return null;

        return (
            <div key={group.title} className="mb-6 last:mb-0">
                <div className="flex items-center gap-2.5 pb-2.5 mb-4 border-b border-default-100">
                    {group.icon && (
                        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary text-white dark:text-background shrink-0">
                            {group.icon}
                        </div>
                    )}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                        <h3 className="text-xs uppercase tracking-wider font-bold text-default-600">
                            {group.title}
                        </h3>
                        {group.description && (
                            <span className="text-xs text-default-400">
                                • {group.description}
                            </span>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {groupFields.map((field) => (
                        <div
                            key={field.name}
                            className={field.colSpan === 2 ? "col-span-2" : "col-span-1"}
                        >
                            {renderField({
                                field,
                                form,
                                handleChange,
                                errors: errors as Record<string, string>,
                            })}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            backdrop="blur"
            size={size}
            scrollBehavior="inside"
            onClose={handleClose}
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader>{title}</ModalHeader>

                        <ModalBody>
                            {groups.length > 0 ? (
                                <>
                                    {groups.map((group) => {
                                        const groupFields = groupedFields[group.title] || [];
                                        return renderGroup(group, groupFields);
                                    })}
                                    {groupedFields.ungrouped.length > 0 && (
                                        <div className="grid grid-cols-2 gap-4">
                                            {groupedFields.ungrouped.map((field) => (
                                                <div
                                                    key={field.name}
                                                    className={field.colSpan === 2 ? "col-span-2" : "col-span-1"}
                                                >
                                                    {renderField({
                                                        field,
                                                        form,
                                                        handleChange,
                                                        errors: errors as Record<string, string>,
                                                    })}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="grid grid-cols-2 gap-4">
                                    {fields.map((field) => (
                                        <div
                                            key={field.name}
                                            className={field.colSpan === 2 ? "col-span-2" : "col-span-1"}
                                        >
                                            {renderField({
                                                field,
                                                form,
                                                handleChange,
                                                errors: errors as Record<string, string>,
                                            })}
                                        </div>
                                    ))}
                                </div>
                            )}
                            {children}
                        </ModalBody>

                        <ModalFooter>
                            <Button
                                variant="light"
                                onPress={onClose}
                                isDisabled={isLoading}
                            >
                                {cancelLabel}
                            </Button>
                            <Button
                                color="primary"
                                onPress={handleSubmit}
                                isLoading={isLoading}
                                isDisabled={isLoading}
                            >
                                {submitLabel}
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}