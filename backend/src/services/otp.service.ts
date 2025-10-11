import { redis } from "../redis/index";
export const sendOTP = async (mobileNumber: string, message: string) => {
  try {
    const formData = new FormData();
    formData.append(
      "api_key",
      process.env.ADN_API_KEY || "KEY-svhz8j45stq4r6ous60qktwmxrru6ken",
    );
    formData.append(
      "api_secret",
      process.env.ADN_API_SECRET || "gOfCUZWc4F$D64eS",
    );
    formData.append("request_type", "OTP");
    formData.append("message_type", "TEXT");
    formData.append("mobile", mobileNumber);
    formData.append("message_body", message);
    const res = await fetch(
      process.env.SMSAPI ||
        ("https://portal.adnsms.com/api/v1/secure/send-sms" as string),
      {
        method: "POST",
        body: formData,
      },
    )
      .then((res) => res.json())
      .then((res) => res)
      .catch((e) => console.log(e));

    if (res.api_response_message === "SUCCESS") {
      return "sms sent";
    } else {
      return "";
    }
    // return res;
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const saveOTPPhoneNumber = async (mobileNumber: string, otp: string) => {
  try {
    redis.set(mobileNumber, otp);
    return "OTP saved to redis";
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const verifyOTP = async (mobileNumber: string, otp: string) => {
  try {
    const savedOTP = await redis.get(mobileNumber);
    if (savedOTP == otp) return true;
    else return false;
  } catch (error) {
    console.log(error);
  }
};

export const deleteOTP = async (mobileNumber: string) => {
  try {
    await redis.del(mobileNumber);
  } catch (error) {
    console.log(error);
  }
};
