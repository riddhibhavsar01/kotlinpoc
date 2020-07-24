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

class SurveyorListAdapter(var context: Context, var users: ArrayList<String>) : RecyclerView.Adapter<SurveyorListAdapter.UserViewHolder>() {
    fun updateUsers(newUsers: List<String>) {
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
        fun bind(surveyor: String) {
            layerName.text = surveyor
            layerName.setOnClickListener{

               Toast.makeText(context,"clicked",Toast.LENGTH_SHORT).show()
            }
        }
    }
}