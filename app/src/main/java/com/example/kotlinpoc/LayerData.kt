package com.example.kotlinpoc

import com.google.gson.annotations.Expose
import com.google.gson.annotations.SerializedName
import java.util.*

data class LayerData(

    val layerName: String,

    @SerializedName("geomtype")
    val geomType: String,

    @SerializedName("id")
    val layerId : Int
)