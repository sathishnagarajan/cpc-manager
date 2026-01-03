package com.cpc.manager

import android.annotation.SuppressLint
import android.os.Bundle
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        webView = findViewById(R.id.webview)

        // Enable JavaScript
        webView.settings.javaScriptEnabled = true
        webView.settings.domStorageEnabled = true

        // Fix font rendering and layout issues
        webView.settings.useWideViewPort = true
        webView.settings.loadWithOverviewMode = true
        webView.settings.textZoom = 100 // Disable text scaling
        webView.settings.builtInZoomControls = false
        webView.settings.displayZoomControls = false

        // Ensure links open within the WebView instead of the browser
        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                return false // Allow WebView to load the URL
            }
        }

        // Load the URL
        // Use 10.0.2.2 for Android Emulator to access localhost
        // Use your machine's IP address (e.g., 192.168.1.x) for physical devices
        webView.loadUrl("http://10.0.2.2:3000")
    }

    // Handle back button press to navigate back in WebView history
    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }
}
