import { Stack, useRouter, useSearchParams } from "expo-router";
import { useCallback, useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Share
} from "react-native";

import {
  Company,
  JobAbout,
  JobFooter,
  JobTabs,
  ScreenHeaderBtn,
  Specifics,
} from "../../components";
import { COLORS, icons, SIZES } from "../../constants";
import useFetch from "../../hooks/useFetch";
import Toast from '../../components/Toast';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
const tabs = ["About", "Qualifications", "Responsibilities"];
import axios from 'axios';

const JobDetails = () => {
  const params = useSearchParams();
  const router = useRouter();
  const toastRef = useRef();

  const { data, isLoading, error, refetch, exists } = useFetch("job-details", {
    job_id: params.id,
  });

  const [isLiked, setIsLiked] = useState(exists);

  useEffect(() => {
    setIsLiked(exists);
  }, [exists]);

  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [refreshing, setRefreshing] = useState(false);

  const handleLikePress = () => {
    toastRef.current.show({
      type: 'success',
      text: `Job added to your Wishlist 🎉`,
      duration: 2500,
    });
    setIsLiked(true);
  };

  const handleUnLikePress = async () => {
    try {
      // Make an API call using Axios to send data to the server
      const response = await axios.delete(`https://ezhire.onrender.com/wishlist/delete/?job_id=${params.id}`,);

      if (response.status === 200) {
        toastRef.current.show({
          type: 'success',
          text: `Job remove from your Wishlist 🎉`,
          duration: 2500,
        });
        setIsLiked(false);
      }
    } catch (error) {
      console.error("API Error:", error);
    }

  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch()
    setRefreshing(false)
  }, []);

  const shareJob = () => {
    const jobUrl = data[0]?.job_google_link ?? 'https://careers.google.com/jobs/results/';

    // Share.share({
    //   message: `Check out this job: ${jobUrl}`,
    //   url: jobUrl,
    //   title: 'Job Details',
    // });
    const jobDetails = `*Title*: ${data[0].job_title}
*Company*: ${data[0].employer_name}
*Location*: ${data[0].job_country}`;

    // Call the share function with the URL and job details
    handleShare(jobUrl, jobDetails);
  };

  const handleShare = (jobUrl, jobDetails) => {
    const message = `I found an interesting job on *Ezhire*! 🥳 \n\n*Check out the details*:\n${jobDetails}\n\n${jobUrl}`;
    const title = 'Job Details';

    Share.share({
      message,
      url: jobUrl,
      title,
    });
  };


  const displayTabContent = () => {
    switch (activeTab) {
      case "Qualifications":
        return (
          <Specifics
            title='Qualifications'
            points={data[0].job_highlights?.Qualifications ?? ["N/A"]}
          />
        );

      case "About":
        return (
          <JobAbout info={data[0].job_description ?? "No data provided"} />
        );

      case "Responsibilities":
        return (
          <Specifics
            title='Responsibilities'
            points={data[0].job_highlights?.Responsibilities ?? ["N/A"]}
          />
        );

      default:
        return null;
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.lightWhite }}>
        <Stack.Screen
          options={{
            headerStyle: { backgroundColor: COLORS.lightWhite },
            headerShadowVisible: false,
            headerBackVisible: false,
            headerLeft: () => (
              <ScreenHeaderBtn
                iconUrl={icons.left}
                dimension='60%'
                handelPress={() => router.back()}
              />
            ),
            headerRight: () => (
              <ScreenHeaderBtn iconUrl={icons.share} dimension='60%' handelPress={shareJob} />
            ),
            headerTitle: "",
          }}
        />
        <Toast ref={toastRef} />


        <>
          <ScrollView showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          >
            {isLoading ? (
              <View style={{ marginVertical: '80%', alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator size='large' color={COLORS.primary} />
              </View>
            ) : error ? (
              <Text>Something went wrong</Text>
            ) : data.length === 0 ? (
              <Text>No data available</Text>
            ) : (
              <View style={{ padding: SIZES.medium, paddingBottom: 100 }}>
                <Company
                  companyLogo={data[0].employer_logo}
                  jobTitle={data[0].job_title}
                  companyName={data[0].employer_name}
                  location={data[0].job_country}
                />

                <JobTabs
                  tabs={tabs}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                />

                {displayTabContent()}
              </View>
            )}
          </ScrollView>

          <JobFooter
            url={data[0]?.job_google_link ?? 'https://careers.google.com/jobs/results/'}
            data={data}
            handleLikePress={handleLikePress}
            isLiked={isLiked}
            handleUnLikePress={handleUnLikePress}
          />
        </>
      </SafeAreaView>
    </GestureHandlerRootView>

  );
};

export default JobDetails;