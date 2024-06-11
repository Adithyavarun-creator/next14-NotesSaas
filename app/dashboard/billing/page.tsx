import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import prisma from '../../lib/db'
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { getStripeSession, stripe } from "@/lib/stripe";
import { redirect } from "next/navigation";
import { StripePortal, StripeSubscriptionCreationButton } from "@/app/components/SubmitButtons";
import { unstable_noStore as noStore } from "next/cache";

const featuredItems = [
    { name: 'Lorem Ipsum Something' },
    { name: 'Lorem Ipsum Something' },
    { name: 'Lorem Ipsum Something' },
    { name: 'Lorem Ipsum Something' },
    { name: 'Lorem Ipsum Something' },
]


async function getData(userId: string) {
    noStore()
    const data = await prisma.subscription.findUnique({
        where: {
            userId: userId
        },
        select: {
            status: true,
            user: {
                select: {
                    stripeCustomerId: true
                }
            }
        }
    })
    return data
}

export default async function BillingPage() {

    const { getUser } = getKindeServerSession()
    const user = await getUser();
    const data = await getData(user?.id as string)


    async function createSubscription() {
        'use server'

        const dbUser = await prisma.user.findUnique({
            where: {
                id: user?.id
            },
            select: {
                stripeCustomerId: true
            }
        })
        if (!dbUser?.stripeCustomerId) {
            throw new Error('Unable to get customer id')
        }

        const subscriptionUrl = await getStripeSession({
            customerId: dbUser.stripeCustomerId,
            domainUrl: "http://localhost:3000",
            priceId: process.env.STRIPE_PRICE_ID as string
        })

        return redirect(subscriptionUrl)
    }


    async function createCustomerPoratl() {
        'use server'
        const session = await stripe.billingPortal.sessions.create({
            customer: data?.user.stripeCustomerId as string,
            return_url: "http://localhost:3000/dashboard"
        })
        return redirect(session.url)
    }

    if (data?.status === 'active') {
        return (
            <div className="grid items-start gap-8">
                <div className="flex items-center justify-between px-2">
                    <div className="grid gap-1">
                        <h1 className="text-3xl md:text-4xl ">Subscription</h1>
                        <p className="text-lg text-muted-foreground">
                            Settings reagding your subscription
                        </p>
                    </div>
                </div>

                <Card className="w-full lg:w-2/3">
                    <CardHeader>
                        <CardTitle>Edit Subscription</CardTitle>
                        <CardDescription>
                            Click on the button below, this will give you the opportunity to
                            change your payment details and view your statement at the same
                            time.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form action={createCustomerPoratl}>
                            <StripePortal />
                        </form>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto space-y-4">
            <Card className="flex flex-col">
                <CardContent className="py-8">
                    <div>
                        <h3 className="inline-flex px-4 py-1 text-sm font-semibold 
                        tracking-wide uppercase bg-primary/10 text-primary">Monthly</h3>
                    </div>

                    <div className="mt-4 flex items-baseline text-6xl font-extrabold">
                        $30 <span className="ml-1 text-2xl font-medium text-muted-foreground">/mo</span>
                    </div>
                    <p className="mt-5 text-lg text-muted-foreground">Write as many as notes per month</p>
                </CardContent>

                <div className="flex flex-col justify-between px-6 pt-6 pb-8 bg-secondary rounded-lg space-y-6 sm:p-10 sm:pt-6">
                    <ul className="space-y-4">
                        {
                            featuredItems.map((item, i) => (
                                <li
                                    className="flex items-center"
                                    key={i}>
                                    <div className="flex-shrink-0">
                                        <CheckCircle2 className="h-6 w-6 text-green-500" />
                                    </div>
                                    <p className="ml-3 text-base">{item.name}</p>
                                </li>
                            ))
                        }
                    </ul>

                    <form className="w-full" action={createSubscription}>
                        <StripeSubscriptionCreationButton />
                    </form>
                </div>
            </Card>
        </div>
    )
}