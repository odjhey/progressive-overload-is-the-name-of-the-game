import { PropsWithChildren } from "react";
import { Link } from "react-router-dom";

export default function Nav({ children }: PropsWithChildren) {

    return <>
        <div>
            <nav>
                <ol className="flex gap-4 p-2 bg-primary" >
                    <li className="text-primary-content">
                        <Link to="/">Home</Link>
                    </li>
                    <li className="text-primary-content">
                        <Link to="/about">About</Link>
                    </li>
                </ol>
            </nav>


        </div>

        {children}
    </>



}