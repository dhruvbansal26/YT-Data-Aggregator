"use server";
import { DataSchema } from "@/schemas";
import * as z from "zod";

export const FetchData = async (values: z.infer<typeof DataSchema>) => {
  const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
  // Ensure input validation
  const validatedFields = DataSchema.parse(values);

  // Function to fetch data for a single user
  const fetchUserData = async ({ username }: { username: string }) => {
    try {
      // Fetch channel information
      const channelResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?key=${apiKey}&forHandle=${username}&part=statistics`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const channelData = await channelResponse.json();

      if (!channelData.items || channelData.items.length === 0) {
        return {
          username,
          error: "Channel not found. Please check the username and try again.",
        };
      }
      const channelId = channelData.items[0].id;

      // Fetch videos from the channel
      const videoFetchResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet&order=date&maxResults=10`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const videosFetched = await videoFetchResponse.json();

      if (!videosFetched.items || videosFetched.items.length === 0) {
        return { username, error: "No videos found for this channel." };
      }

      // Fetch statistics for each video
      const videoIds = videosFetched.items.map(
        (video: any) => video.id.videoId
      );
      const videoDataPromises = videoIds.map((videoId: any) =>
        fetch(
          `https://www.googleapis.com/youtube/v3/videos?key=${apiKey}&part=statistics&id=${videoId}`
        )
          .then((response) => response.json())
          .then((data) => {
            const video = data.items[0];
            return {
              videoId: video.id,
              viewCount: video.statistics.viewCount,
              likeCount: video.statistics.likeCount,
              commentCount: video.statistics.commentCount,
            };
          })
      );

      const videoData = await Promise.all(videoDataPromises);

      return { username, videos: videoData }; // Return data structured as per requirements
    } catch (error) {
      console.error(`Error fetching data for ${username}:`, error);
      return { username, error: "An error occurred while fetching data." };
    }
  };

  // Process all users concurrently
  const userDataPromises = validatedFields.users.map(fetchUserData);
  const results = await Promise.all(userDataPromises);

  console.log("Results:", results);

  const finalResult = results.map((result) => {
    const videos = result.videos ?? []; // Use nullish coalescing to default to an empty array if undefined

    if (videos.length > 0) {
      const totalViews = videos.reduce(
        (acc, video) => acc + parseInt(video.viewCount, 10),
        0
      );
      const totalLikes = videos.reduce(
        (acc, video) => acc + parseInt(video.likeCount, 10),
        0
      );
      const totalComments = videos.reduce(
        (acc, video) => acc + parseInt(video.commentCount, 10),
        0
      );
      const numberOfVideos = videos.length;

      const averageViews = totalViews / numberOfVideos;
      const averageLikes = totalLikes / numberOfVideos;
      const averageComments = totalComments / numberOfVideos;

      return {
        username: result.username,
        averageViews,
        averageComments,
        averageLikes,
        numberOfVideos,
        error: result.error,
      };
    } else {
      // Return some default values for users with no videos or when videos are undefined
      return {
        username: result.username,
        averageViews: 0,
        averageComments: 0,
        averageLikes: 0,
        numberOfVideos: 0,
        error: result.error ?? "No videos found or videos data unavailable", // Use nullish coalescing here too
      };
    }
  });

  console.log("Final result:", finalResult);

  return finalResult;
};
