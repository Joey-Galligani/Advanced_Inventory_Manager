import { Redirect } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { useEffect } from "react";

const Index = () => {
  useEffect(() => {
    try {
      ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP
      );
    } catch (err) {
      console.log(err);
    }
  }, []);

  return <Redirect href="/login" />;
};

export default Index;
