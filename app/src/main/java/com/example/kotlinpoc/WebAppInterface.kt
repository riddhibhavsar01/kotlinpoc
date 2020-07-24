import android.content.Context
import android.util.Log
import android.webkit.JavascriptInterface
import android.webkit.WebView

class WebAppInterface(var context: Context,var webView: WebView) {

   @JavascriptInterface
   fun setMapExtent(extent : String){

Log.d("msg","msg : "+extent)
   }
}