package com.example.kotlinpoc

import com.google.gson.annotations.Expose

data class FieldData(
    @Expose(serialize = true, deserialize = true)
    var name: String,
    @Expose(serialize = true, deserialize = true)
var type: String,
@Expose(serialize = false, deserialize = false)
var ivType : Int,
@Expose(serialize = true, deserialize = true)
var values: String,
@Expose(serialize = false, deserialize = false)
var selectedValue: String,
@Expose(serialize = true, deserialize = true)
var requiredField : Int

)