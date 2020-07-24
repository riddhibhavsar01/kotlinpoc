package com.example.kotlinpoc

import com.google.gson.annotations.Expose
import com.google.gson.annotations.SerializedName
import java.util.*

data class TableData(
    @SerializedName("avatar")
    val avatar: String,


    @SerializedName("name")
    val tableName: String,

    @SerializedName("geomtype")
    val geomType: String,
    @SerializedName("structure")
    val structure: ArrayList<FieldData>,
    @SerializedName("id")
    val layerId : Int
)