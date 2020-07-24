package com.example.kotlinpoc

import WebAppInterface
import android.os.Bundle
import android.webkit.JsResult
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity


class MapActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_map)

        var webView1 = findViewById(R.id.webview) as WebView


        webView1.getSettings().setJavaScriptEnabled(true)
        webView1.clearCache(true);
        webView1.clearHistory();
        webView1.getSettings().setJavaScriptCanOpenWindowsAutomatically(true);
        webView1.addJavascriptInterface(WebAppInterface(this, webView1), "appInterface")
        webView1.loadUrl("file:///android_asset/index.html")
        webView1.setWebChromeClient(object : WebChromeClient() {
            //Other methods for your WebChromeClient here, if needed..
            override fun onJsAlert(
                view: WebView,
                url: String,
                message: String,
                result: JsResult
            ): Boolean {
                return super.onJsAlert(view, url, message, result)
            }
        })
        webView1.webViewClient = object : WebViewClient() {
            override fun onPageFinished(view: WebView?, url: String?) {
                webView1.loadUrl("javascript:alertDialogMap()")
            }
        }

    }
}
