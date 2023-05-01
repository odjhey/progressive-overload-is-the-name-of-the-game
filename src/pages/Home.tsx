import localforage from "localforage";
import { PropsWithChildren, useEffect } from "react";
import { useForm, useFieldArray, } from "react-hook-form";
import { useLifts } from "../hooks/useLifts";

type FormValues = {
    lifts: {
        date: string,
        name: string;
        weight: number;
        uom: string;
        set: number;
        rep: number;
    }[];
};

const LabeledFieldLayout = ({ children }: PropsWithChildren) => {
    return (
        <div className="flex gap-1 border border-solid border-red-100">
            {children}
        </div>
    )
}


const LiftsForm = ({ lifts, onSubmit }: { lifts: unknown[], onSubmit: (d: unknown[]) => Promise<unknown> }) => {
    const {
        register,
        control,
        handleSubmit,
        setFocus,
        formState: { errors }
    } = useForm<FormValues>({
        defaultValues: { lifts: lifts as any[] },
        mode: "onBlur"
    });

    const { fields, append, remove } = useFieldArray({
        name: "lifts",
        control
    });

    const onSubmitForm = (data: FormValues) => {
        onSubmit(data.lifts)
    }

    const TAB_FIELD_COUNT = 6

    return (
        <div>
            <form onSubmit={handleSubmit(onSubmitForm)}>
                {fields.map((field, index) => {
                    return (
                        <div key={field.id}>
                            <section className="flex flex-wrap gap-1 p-1" key={field.id}>

                                <input
                                    tabIndex={1 + (index * TAB_FIELD_COUNT)}
                                    {...register(`lifts.${index}.date` as const, {
                                        required: true
                                    })}
                                    className={errors?.lifts?.[index]?.date ? "error" : ""}
                                    type="datetime-local"
                                />

                                <LabeledFieldLayout>
                                    <label className="label" htmlFor={`lifts.${index}.name`}>name</label>
                                    <input
                                        onKeyUp={(e) => {
                                            if (e.key === 'Enter') {
                                                setFocus(`lifts.${index}.weight`)
                                            }
                                        }}
                                        tabIndex={2 + (index * TAB_FIELD_COUNT)}
                                        placeholder="name"
                                        {...register(`lifts.${index}.name` as const, {
                                            required: true
                                        })}
                                        className={errors?.lifts?.[index]?.name ? "error" : ""}
                                    />
                                </LabeledFieldLayout>

                                <LabeledFieldLayout>
                                    <label className="label" htmlFor={`lifts.${index}.weight`}>weight</label>
                                    <input
                                        onKeyUp={(e) => {
                                            if (e.key === 'Enter') {
                                                setFocus(`lifts.${index}.rep`)
                                            }
                                        }}
                                        tabIndex={3 + (index * TAB_FIELD_COUNT)}
                                        placeholder="weight"
                                        type="number"
                                        {...register(`lifts.${index}.weight` as const, {
                                            valueAsNumber: true,
                                            required: true
                                        })}
                                        className={errors?.lifts?.[index]?.weight ? "error" : "w-16"}
                                    /></LabeledFieldLayout>

                                <LabeledFieldLayout>
                                    <label className="label" htmlFor={`lifts.${index}.uom`}>uom</label>
                                    <input
                                        onKeyUp={(e) => {
                                            if (e.key === 'Enter') {
                                                setFocus(`lifts.${index}.rep`)
                                            }
                                        }}
                                        tabIndex={4 + (index * TAB_FIELD_COUNT)}
                                        placeholder="uom"
                                        {...register(`lifts.${index}.uom` as const, {
                                            required: true
                                        })}
                                        className={errors?.lifts?.[index]?.name ? "error" : "w-16"}
                                    />
                                </LabeledFieldLayout>

                                <LabeledFieldLayout>
                                    <label className="label" htmlFor={`lifts.${index}.rep`}>rep</label>
                                    <input
                                        onKeyUp={(e) => {
                                            if (e.key === 'Enter') {
                                                setFocus(`lifts.${index}.set`)
                                            }
                                        }}
                                        tabIndex={5 + (index * TAB_FIELD_COUNT)}
                                        placeholder="rep"
                                        type="number"
                                        {...register(`lifts.${index}.rep` as const, {
                                            valueAsNumber: true,
                                            required: true
                                        })}
                                        className={errors?.lifts?.[index]?.rep ? "error" : "w-12"}
                                    />
                                </LabeledFieldLayout>


                                <LabeledFieldLayout>
                                    <label className="label" htmlFor={`lifts.${index}.set`}>set</label>
                                    <input
                                        onKeyUp={(e) => {
                                            if (e.key === 'Enter') {
                                                // TODO set focus to submit
                                            }
                                        }}
                                        tabIndex={6 + (index * TAB_FIELD_COUNT)}
                                        placeholder="set"
                                        type="number"
                                        {...register(`lifts.${index}.set` as const, {
                                            valueAsNumber: true,
                                            required: true
                                        })}
                                        className={errors?.lifts?.[index]?.set ? "error" : "w-12"}
                                    />
                                </LabeledFieldLayout>

                                <button className="btn btn-error btn-xs" type="button" onClick={() => remove(index)}>
                                    x
                                </button>
                            </section>
                            <div className="bg-slate-100 p-2"></div>
                        </div>
                    );
                })}


                <div className="flex gap-1 pb-10">
                    <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                            append({
                                name: "",
                                date: (new Date()).toISOString().substring(0, 16),
                                rep: 0,
                                set: 0,
                                weight: 0,
                                uom: 'lbs',
                            })
                        }
                        }
                    >
                        APPEND
                    </button>
                    <input className="btn btn-primary btn-sm" type="submit" />
                </div>
            </form>
        </div >
    );

}

export default function Home() {
    const { data, error, loading, saveLifts } = useLifts()
    console.log({ data, error })

    if (loading) {
        return <div>Loading...</div>
    }

    if (error) {
        return <div>{error.message}</div>
    }

    return <LiftsForm lifts={data} onSubmit={(d: unknown[]) => saveLifts(d)}></LiftsForm>


}
