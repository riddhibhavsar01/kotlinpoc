package com.example.kotlinpoc

import com.google.gson.annotations.Expose
import com.google.gson.annotations.SerializedName
import java.util.*

data class CreateTableData(

    @SerializedName("tables")
    val tableData: ArrayList<TableData>
)