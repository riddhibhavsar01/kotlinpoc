package com.example.kotlinpoc

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.util.Log
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat

class MainActivity : AppCompatActivity() {

    private val splashTime: Long = 3000
    private val splashActive = true
    private val paused = false
    private var ms : Int=0;
    var PERMISSIONS = arrayOf(
        Manifest.permission.READ_CONTACTS,
        Manifest.permission.RECORD_AUDIO
    )
    val PERMISSION_ALL : Int =1;
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        startThreadToWait()
        if(!checkPermission(Manifest.permission.READ_CONTACTS,
                Manifest.permission.RECORD_AUDIO)){
            requestPermission()
            ActivityCompat.requestPermissions(this, PERMISSIONS, PERMISSION_ALL);
        }

    }

    private fun requestPermission() {

        Toast.makeText(this@MainActivity,"permission required ",Toast.LENGTH_SHORT).show()

    }

    private fun checkPermission(vararg permissions: String): Boolean= permissions.all  {

        ActivityCompat.checkSelfPermission(this@MainActivity, it) == PackageManager.PERMISSION_GRANTED
    }

    private fun startThreadToWait() {
        val thread: Thread = object : Thread() {
            override fun run() {
                try {
                    while (splashActive && ms < splashTime) {
                        if (!paused) ms = ms + 100
                        sleep(200)
                    }
                } catch (e: Exception) {
                    e.printStackTrace()
                } finally {
                    startActivity(Intent(this@MainActivity, SecondActivity::class.java))
                    finish()
                }
            }
        }
        thread.start()
    }

    override fun onRequestPermissionsResult(requestCode: Int,
                                             permissions: Array<String>, grantResults: IntArray) {
        when (requestCode) {
            PERMISSION_ALL -> {

                if (grantResults.isEmpty() || grantResults[0] != PackageManager.PERMISSION_GRANTED
                    || grantResults[1] != PackageManager.PERMISSION_GRANTED
                ) {

                    Log.i("TAG", "Permission has been denied by user")
                } else {
                    Log.i("TAG", "Permission has been granted by user")
                }
            }
        }
    }
}
