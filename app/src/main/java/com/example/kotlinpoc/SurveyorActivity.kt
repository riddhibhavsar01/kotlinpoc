package com.example.kotlinpoc

import android.os.Bundle
import android.util.Log
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.gson.JsonObject
import okhttp3.ResponseBody
import org.json.JSONObject
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import kotlin.collections.ArrayList

class SurveyorActivity : AppCompatActivity() {

     var layerId : Int = 0
    lateinit var recyclerView : RecyclerView
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_surveyor)
        recyclerView = findViewById(R.id.surveyorlist_rv) as RecyclerView
        recyclerView.layoutManager = LinearLayoutManager(this, RecyclerView.VERTICAL, false)
      layerId = intent.extras?.getInt("layerId")!!
       callGetSurveyInfo("2020-05-28","2020-06-01")
    }

    private fun callGetSurveyInfo(startDate: String, tillDate: String) {
        val service: GetDataService = RetrofitClientInstance.getRetrofitInstance().create(
            GetDataService::class.java
        )

        var jsonObject = JsonObject()
        //  filterDateJson = new JsonObject();
        jsonObject.addProperty("id","1100")
        jsonObject.addProperty("layerid", layerId)
        jsonObject.addProperty("ts_startdt", startDate)
        jsonObject.addProperty("ts_enddt", tillDate)
        val call: Call<ResponseBody> = service.getSurveyorList(jsonObject)
        call.enqueue(object : Callback<ResponseBody> {override fun onResponse(call: Call<ResponseBody>,response: Response<ResponseBody>) {
                var res: String? = null
                try {
                    if (response.body() != null) {

                        if (response.body() != null) {
                            res = response.body()!!.string()
                            val rootObj = JSONObject(res)
                            if (!rootObj.getString("message").equals("Invalid user",ignoreCase = true)) {
                                Log.d("Success", "Login success")
                                val obj = rootObj.getJSONObject("data")
                                val tableArray = obj.getJSONArray("surveyor")
                                var surveyorNameList : ArrayList<String> =ArrayList()

                                for(i in 0 until tableArray.length()){
                                    val surveyor = tableArray.getJSONObject(i)
                                    surveyorNameList.add(surveyor.getString("name"))

                                }

                               var adapter= SurveyorListAdapter(this@SurveyorActivity,surveyorNameList)

                              recyclerView.adapter = adapter
                            }
                        }

                    }
                } catch (e: Exception) {

                }
                //  Toast.makeText(SignInActivity.this, "response : " + res, Toast.LENGTH_SHORT).show();
            }

            override fun onFailure(call: Call<ResponseBody>, t: Throwable) {
                Toast.makeText(
                    this@SurveyorActivity,
                    "Something went wrong...Please try later!",
                    Toast.LENGTH_SHORT
                ).show()
                println("fail : ")
            }
        })
    }

}
