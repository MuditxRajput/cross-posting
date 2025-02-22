"use client"
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

const PaymentCards = () => {
    const[clicked, setClicked] = useState(false);
  return (
    <div className="flex flex-col md:flex-row gap-6 justify-center items-center p-6">
      {/* Monthly Subscription Card */}
      <Card onClick={()=>setClicked(!clicked)} className={`w-[300px] h-[400px] ${clicked ? "border-2 border-black" :""}`} >
        <CardHeader>
          <CardTitle>Monthly Plan</CardTitle>
          <CardDescription>Pay month-to-month</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">$9.99 <span className="text-sm font-normal">/month</span></p>
          <ul className="mt-4 space-y-2">
            <li>✅ Feature 1</li>
            <li>✅ Feature 2</li>
            <li>✅ Feature 3</li>
            <li>✅ Feature 3</li>
            <li>✅ Feature 3</li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button className="w-full">Subscribe Monthly</Button>
        </CardFooter>
      </Card>

      {/* Yearly Subscription Card */}
      <Card className="w-[300px] h-[400px] ">
        <CardHeader>
          <CardTitle>Yearly Plan</CardTitle>
          <CardDescription>Save 20% with annual billing</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">$95.88 <span className="text-sm font-normal">/year</span></p>
          <p className="text-sm text-muted-foreground">Equivalent to $7.99/month</p>
          <ul className="mt-4 space-y-2">
            <li>✅ Feature 1</li>
            <li>✅ Feature 2</li>
            <li>✅ Feature 3</li>
            <li>✅ Bonus Feature</li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button className="w-full" >Subscribe Yearly</Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default PaymentCards

