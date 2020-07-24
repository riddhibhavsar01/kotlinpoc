package com.example.kotlinpoc

import android.content.Context
import android.content.Intent
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import java.util.*
import androidx.recyclerview.widget.RecyclerView
import kotlinx.android.synthetic.main.row_layerlist.view.*

class LayerListAdapter(var context: Context,var users: ArrayList<LayerData>) : RecyclerView.Adapter<LayerListAdapter.UserViewHolder>() {
    fun updateUsers(newUsers: List<LayerData>) {
        users.clear()
        users.addAll(newUsers)
        notifyDataSetChanged()
    }
    override fun onCreateViewHolder(parent: ViewGroup, p1: Int) = UserViewHolder(
        LayoutInflater.from(parent.context).inflate(R.layout.row_layerlist, parent, false)
    )
    override fun getItemCount() = users.size
    override fun onBindViewHolder(holder: UserViewHolder, position: Int) {
        holder.bind(users[position])

    }
   inner class UserViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        private val layerName = view.tv_layer_name
        fun bind(layer: LayerData) {
            layerName.text = layer.layerName
            layerName.setOnClickListener{
                var i = Intent(context, SurveyorActivity::class.java)
                i.putExtra("layerId",layer.layerId)
                i.putExtra("layerName",layer.layerName)
                context.startActivity(i)
               // Toast.makeText(context,"clicked",Toast.LENGTH_SHORT).show()
            }
        }
    }
}