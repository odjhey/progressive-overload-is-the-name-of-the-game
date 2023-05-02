import { useLifts } from "../hooks/useLifts";
import { LiftForm } from "../components/LiftForm";
import { useNavigate, useSearchParams } from "react-router-dom";
import { defaultParseSearch } from "../libs/searchParams";

export default function New() {
    const [search] = useSearchParams()
    const liftInSearch = defaultParseSearch(search.toString())

    const { error, loading, appendLift } = useLifts()
    const navigate = useNavigate()

    if (loading) {
        return <div>Loading...</div>
    }

    if (error) {
        return <div>{error.message}</div>
    }

    const defaults = (liftInSearch && (liftInSearch as any).lift) ?? {
        date: (new Date()).toISOString().substring(0, 16),
        name: "",
        rep: 0,
        set: 0,
        uom: "lbs",
        weight: 0
    }

    return <LiftForm lift={defaults} onSubmit={(lift) => appendLift(lift, { onSuccess: () => navigate('/') })}></LiftForm>
}
