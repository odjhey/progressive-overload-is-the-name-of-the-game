import { useEffect } from "react";
import { useForm, useFieldArray, } from "react-hook-form";

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


export default function App() {

  const lskey = 'ZLDKSJF'

  const local =
    JSON.parse(localStorage.getItem(lskey) || JSON.stringify({ lifts: [] })) as FormValues

  const {
    register,
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValues>({
    defaultValues: local,
    mode: "onBlur"
  });

  useEffect(() => {
    console.log(localStorage.getItem(lskey))

  }, [])


  const { fields, append, remove } = useFieldArray({
    name: "lifts",
    control
  });

  const onSubmit = (data: FormValues) => {
    console.log(data)
    localStorage.setItem(lskey, JSON.stringify(data))
  }

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        {fields.map((field, index) => {
          return (
            <div key={field.id}>
              <section className="flex flex-wrap" key={field.id}>
                <input
                  {...register(`lifts.${index}.date` as const, {
                    required: true
                  })}
                  className={errors?.lifts?.[index]?.date ? "error" : ""}
                  type="datetime-local"
                />

                <input
                  placeholder="name"
                  {...register(`lifts.${index}.name` as const, {
                    required: true
                  })}
                  className={errors?.lifts?.[index]?.name ? "error" : ""}
                />

                <input
                  placeholder="weight"
                  type="number"
                  {...register(`lifts.${index}.weight` as const, {
                    valueAsNumber: true,
                    required: true
                  })}
                  className={errors?.lifts?.[index]?.weight ? "error" : ""}
                />

                <input
                  placeholder="uom"
                  {...register(`lifts.${index}.uom` as const, {
                    required: true
                  })}
                  className={errors?.lifts?.[index]?.name ? "error" : ""}
                />

                <input
                  placeholder="rep"
                  type="number"
                  {...register(`lifts.${index}.rep` as const, {
                    valueAsNumber: true,
                    required: true
                  })}
                  className={errors?.lifts?.[index]?.rep ? "error" : ""}
                />
                <input
                  placeholder="set"
                  type="number"
                  {...register(`lifts.${index}.set` as const, {
                    valueAsNumber: true,
                    required: true
                  })}
                  className={errors?.lifts?.[index]?.set ? "error" : ""}
                />

                <button className="btn btn-error btn-sm" type="button" onClick={() => remove(index)}>
                  DELETE
                </button>
              </section>
            </div>
          );
        })}


        <div className="flex gap-1">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              console.log(

                "date:", (new Date()).toISOString().substring(0, 16),
              )
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
