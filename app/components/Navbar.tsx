import Link from "next/link"
import { ThemeToggle } from "./theme-toggle"
import { Button } from "@/components/ui/button"
import { RegisterLink, LoginLink, LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { UserNav } from "./UserNav";

export const Navbar = async () => {

    const { isAuthenticated, getUser } = getKindeServerSession()

    const user = await getUser()

    return (
        <nav className="border-b bg-background h-[10vh] flex items-center">
            <div className="container flex justify-between items-center">
                <Link href='/'>
                    <h1 className="font-bold text-3xl">Notes<span className="text-primary">Sass</span></h1>
                </Link>


                <div className="flex items-center gap-x-5">
                    <ThemeToggle />

                    {
                        (await isAuthenticated()) ? (
                            // <LogoutLink>
                            //     <Button>Logout</Button>
                            // </LogoutLink>
                            <UserNav
                                email={user?.email as string}
                                image={user?.picture as string}
                                name={user?.given_name as string}

                            />
                        ) : (
                            <div className="flex items-center gap-x-5">

                                <LoginLink>
                                    <Button>Sign In</Button>
                                </LoginLink>

                                <RegisterLink>
                                    <Button variant='secondary'>Sign Up</Button>
                                </RegisterLink>

                            </div>
                        )
                    }
                </div >
            </div >
        </nav >
    )
}
