"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DataSchema } from "@/schemas"; // Make sure this schema supports an array of { username: string; link: string; }
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FetchData } from "@/actions/fetch-data";
import { useFieldArray } from "react-hook-form";
import { useTransition } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FormError } from "./form-error";
import { FormSuccess } from "./form-success";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserData {
  username: string;
  channelThumbnailUrl: string;
  totalChannelViews: number;
  videoCount: number;
  subscriberCount: number;
  averageViews: number;
  averageLikes: number;
  averageComments: number;
  numberOfVideos: number;
  engagementRate: number;
  error: string | undefined;
  latestVideoId: string;
}

export const DataForm = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const [userData, setUserData] = useState<UserData[]>([]);

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
        setUserData(response);
        setSuccessMessage("Data fetched successfully!");
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
      <div>
        {userData.map((user, index) => (
          <div key={index}>
            <Card>
              <CardHeader>{user.username}</CardHeader>
              <CardContent>
                {user.channelThumbnailUrl && (
                  <>
                    <Avatar>
                      <AvatarImage src={user.channelThumbnailUrl} />

                      <AvatarFallback>N/A</AvatarFallback>
                    </Avatar>
                  </>
                )}
                <div
                  className="video-embed-container"
                  style={{
                    position: "relative",
                    paddingBottom: "56.25%" /* 16:9 Aspect Ratio */,
                    paddingTop: "25px",
                    height: 0,
                  }}
                >
                  <iframe
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                    }}
                    src={`https://www.youtube.com/embed/${user.latestVideoId}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="Embedded YouTube Video"
                  ></iframe>
                </div>
                <p>Subsriber Count: {user.subscriberCount}</p>
                <p>Total Channel Views: {user.totalChannelViews}</p>
                <p>Number of Videos: {user.numberOfVideos}</p>
                <p>Average Views: {user.averageViews}</p>
                <p>Average Comments: {user.averageComments}</p>
                <p>Average Likes: {user.averageLikes}</p>
                <p>Engagement Rate: {user.engagementRate}%</p>
                {user.error && <FormError message={user.error}></FormError>}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </>
  );
};
