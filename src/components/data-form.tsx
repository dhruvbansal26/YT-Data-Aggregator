"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { DataSchema } from "@/schemas"; // Make sure this schema supports an array of { username: string; link: string; }
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FetchData } from "@/actions/fetch-data";
import { useFieldArray } from "react-hook-form";
import { useTransition } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FormError } from "./form-error";
import { FormSuccess } from "./form-success";

export const DataForm = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(DataSchema),
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "users",
  });

  async function onSubmit(data: any) {
    setErrorMessage("");
    setSuccessMessage("");
    startTransition(async () => {
      try {
        const response = await FetchData({ users: data.users });
      } catch (error) {
        setErrorMessage("An error occurred while fetching data");
      }
    });
  }

  return (
    <>
      <Card className="flex flex-col items-center w-[380px]">
        <CardHeader>
          <CardTitle className="text-2xl">Card Title</CardTitle>
          <CardDescription>Enter user handles for the channels</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center space-x-2">
                <Input
                  {...register(`users.${index}.username`)}
                  placeholder="Username"
                  defaultValue={field.id} // Important for edit scenarios
                />
                <Button type="button" onClick={() => remove(index)}>
                  Remove
                </Button>
              </div>
            ))}
            <div className="flex flex-row items-center space-x-4">
              <Button type="button" onClick={() => append({ username: "" })}>
                Add User
              </Button>
              <Button type="submit">Submit</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
};
