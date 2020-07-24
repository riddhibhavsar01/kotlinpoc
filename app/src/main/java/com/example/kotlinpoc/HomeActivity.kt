package com.example.kotlinpoc

import android.os.Bundle
import android.text.TextUtils
import android.util.Log
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.gson.Gson

class HomeActivity : AppCompatActivity() {


    var layerDataList : ArrayList<LayerData> = ArrayList()
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_home)
        //getting recyclerview from xml
        val recyclerView = findViewById(R.id.list_recycler_view) as RecyclerView

        //adding a layoutmanager
        recyclerView.layoutManager = LinearLayoutManager(this, RecyclerView.VERTICAL, false)
        val b = intent.extras
        if (b != null) {
           var jsonTable = b.getString("tables").toString()
            if (!TextUtils.isEmpty(jsonTable)) {
                println("table inside$jsonTable")
                parseJsonTable(jsonTable,recyclerView)
            }
        }



    }

    private fun parseJsonTable(jsonTable: String,recyclerView: RecyclerView) {
        val g = Gson()
        val tableData: CreateTableData =
            g.fromJson<CreateTableData>(jsonTable, CreateTableData::class.java)
        Log.d("create table", tableData.toString())
        val tables: java.util.ArrayList<TableData> = tableData.tableData
        for (i in tables.indices) {
            val userTable: TableData = tables[i]
            val data =
                LayerData(userTable.tableName, userTable.geomType, userTable.layerId)
            layerDataList.add(data)
        }


        //creating our adapter
        val adapter = LayerListAdapter(this@HomeActivity,layerDataList)

        //now adding the adapter to recyclerview
        recyclerView.adapter = adapter

    }

}
