package com.example.kotlinpoc

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.google.gson.Gson
import com.google.gson.JsonObject
import kotlinx.android.synthetic.main.activity_second.*
import okhttp3.ResponseBody
import org.json.JSONObject
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class SecondActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_second)

        btn_signin.setOnClickListener(View.OnClickListener {

            sendData(et_email.text.toString(), et_pwd.text.toString())

        })
        btn_map.setOnClickListener{
            startActivity(Intent(this@SecondActivity,MapActivity::class.java))
        }
    }


    private fun sendData(email: String, password: String) {
        val service: GetDataService = RetrofitClientInstance.getRetrofitInstance().create(
            GetDataService::class.java
        )

        var jsonObject = JsonObject()
        jsonObject.addProperty("username", email)
        jsonObject.addProperty("imei", "121110987654321")
        jsonObject.addProperty("password", password)
        jsonObject.addProperty("uid", "uid654321")
        val call: Call<ResponseBody> = service.sendSignInData(jsonObject)
        call.enqueue(object : Callback<ResponseBody> {
            override fun onResponse(
                call: Call<ResponseBody>,
                response: Response<ResponseBody>
            ) {
                var res: String? = null

                try {
                    if (response.body() != null) {
                        res = response.body()!!.string()
                        val rootObj = JSONObject(res)
                        if (rootObj.getBoolean("success") == true) {
                            Log.d("Success", "Login success")
                            val obj = rootObj.getJSONObject("data")
                            val tableArray = obj.getJSONArray("tables")

                            val i = Intent(this@SecondActivity, HomeActivity::class.java)
                            i.putExtra("tables", "{\"tables\":$tableArray}")

                            startActivity(i)
                        }
                    }
                } catch (e: Exception) {

                }
                //  Toast.makeText(SignInActivity.this, "response : " + res, Toast.LENGTH_SHORT).show();
            }

            override fun onFailure(call: Call<ResponseBody>, t: Throwable) {
                Toast.makeText(
                    this@SecondActivity,
                    "Something went wrong...Please try later!",
                    Toast.LENGTH_SHORT
                ).show()
                println("fail : ")
            }
        })
    }

}
