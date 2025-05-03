import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Form,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Define the validation schema
const adminFormSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email format"),
    organization: z.string().min(1, "Organization is required"),
    organizationEmail: z.string().email("Invalid organization email format"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type AdminFormValues = z.infer<typeof adminFormSchema>;

const Register = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<"client" | "admin">("client");

  // Initialize react-hook-form
  const form = useForm<AdminFormValues>({
    resolver: zodResolver(adminFormSchema),
    defaultValues: {
      name: "",
      email: "",
      organization: "",
      organizationEmail: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleUserTypeChange = (type: "client" | "admin") => {
    setUserType(type);
    form.reset();
  };

  const onSubmit = (data: AdminFormValues) => {
    console.log("Signing up with:", userType, data);

    if (userType === "admin") {
      navigate("/dashboard");
    }
  };

  const handleGoogleRegister = () => {
    console.log("Signing up with Google");
    navigate("/complete-profile");
  };

  return (
    <Card className="w-full max-w-md shadow-xl border border-gray-200 rounded-lg overflow-hidden">
      <CardHeader className="p-6">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-primary/10 p-3 border border-primary/20 shadow-sm">
            <ShieldCheck className="h-10 w-10 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-center text-gray-800">
          Confidex Exchange
        </CardTitle>
        <CardDescription className="text-center text-gray-500">
          Secure Document Exchange Platform
        </CardDescription>
        <div className="my-6 flex justify-center">
          <div className="flex space-x-4">
            <button
              onClick={() => handleUserTypeChange("client")}
              className={`px-4 py-2 rounded-md ${
                userType === "client"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Client
            </button>
            <button
              onClick={() => handleUserTypeChange("admin")}
              className={`px-4 py-2 rounded-md ${
                userType === "admin"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Admin
            </button>
          </div>
        </div>
      </CardHeader>

      {userType === "client" ? (
        <CardContent className="mt-4 space-y-6">
          <button
            onClick={handleGoogleRegister}
            className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
              <FcGoogle className="h-5 w-5" />
            </span>
            Sign up with Google
          </button>
          <div className="text-center text-sm text-gray-600">
            <p>
              After signing up, you'll need to provide additional information
              for bank communication.
            </p>
          </div>
        </CardContent>
      ) : (
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="mt-4 space-y-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">Full Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Full Name"
                        {...field}
                        className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">Email address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Email address"
                        type="email"
                        {...field}
                        className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="organization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">Organization</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Organization"
                        {...field}
                        className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="organizationEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">
                      Organization Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Organization Email"
                        type="email"
                        {...field}
                        className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Password"
                        type="password"
                        {...field}
                        className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Confirm Password"
                        type="password"
                        {...field}
                        className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign up
              </Button>
            </form>
          </Form>
        </CardContent>
      )}

      <CardFooter className="bg-gray-50 p-4 border-t border-gray-200">
        <div className="text-center text-xs text-gray-500 w-full">
          Already have an account?{" "}
          <NavLink
            to="/login"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Sign in
          </NavLink>
        </div>
      </CardFooter>
    </Card>
  );
};

export default Register;
