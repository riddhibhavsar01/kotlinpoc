package com.example.kotlinpoc;

import com.google.gson.JsonObject;

import okhttp3.MultipartBody;
import okhttp3.ResponseBody;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.Multipart;
import retrofit2.http.POST;
import retrofit2.http.Part;


public interface GetDataService {


    @POST("ncollectornew/api/login")
    Call<ResponseBody> sendSignInData(@Body JsonObject data);

   // @POST("static/api/surveyinfo")
    @POST("ncollectornew/api/surveyInfo")
    Call<ResponseBody> getSurveyorList(@Body JsonObject data);

   // @POST("static/api/suyveyorinfo")
    @POST("ncollectornew/api/surveyorInfo")
    Call<ResponseBody> getSurveyorProfileInfo(@Body JsonObject data);

  }