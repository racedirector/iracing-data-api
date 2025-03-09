#include "./telemetry_variable.h"

int getEntry(const Napi::CallbackInfo &info)
{
  int entry = 0;
  if (info.Length() > 0 && info[0].IsNumber())
  {
    entry = info[0].As<Napi::Number>().Int32Value();
  }

  return entry;
}

Napi::Object TelemetryVariable::Init(Napi::Env env, Napi::Object exports)
{
  Napi::Function func = DefineClass(env, "TelemetryVariable", {

                                                                  // InstanceAccessor<&TelemetryVariable::GetName, >("name"),
                                                                  // Meta
                                                                  InstanceMethod("type", &TelemetryVariable::GetType),
                                                                  // InstanceAccessor<&TelemetryVariable::GetCount>("count"),
                                                                  // InstanceAccessor<&TelemetryVariable::IsValid>("valid"),
                                                                  // Value
                                                                  InstanceMethod("getBool", &TelemetryVariable::GetBool),
                                                                  InstanceMethod("getInt", &TelemetryVariable::GetInt),
                                                                  InstanceMethod("getFloat", &TelemetryVariable::GetFloat),
                                                                  InstanceMethod("getDouble", &TelemetryVariable::GetDouble),
                                                              });

  Napi::FunctionReference *constructor = new Napi::FunctionReference();
  *constructor = Napi::Persistent(func);
  env.SetInstanceData(constructor);

  exports.Set("TelemetryVariable", func);
  return exports;
}

TelemetryVariable::TelemetryVariable(const Napi::CallbackInfo &info)
    : Napi::ObjectWrap<TelemetryVariable>(info)
{
  if (info.Length() > 0 && info[0].IsString())
  {
    std::string name = info[0].As<Napi::String>().Utf8Value();
    m_var = new irsdkCVar(name.c_str());
  }
  else
  {
    m_var = new irsdkCVar();
  }
}

// ---------------------------
// Meta Accessors
// ---------------------------

Napi::Value TelemetryVariable::GetType(const Napi::CallbackInfo &info)
{
  return Napi::Number::New(info.Env(), m_var->getType());
}

Napi::Value TelemetryVariable::GetCount(const Napi::CallbackInfo &info)
{
  return Napi::Number::New(info.Env(), m_var->getCount());
}

Napi::Value TelemetryVariable::IsValid(const Napi::CallbackInfo &info)
{
  return Napi::Boolean::New(info.Env(), m_var->isValid());
}

// ---------------------------
// Value Accessors
// ---------------------------

Napi::Value TelemetryVariable::GetBool(const Napi::CallbackInfo &info)
{
  return Napi::Boolean::New(info.Env(), m_var->getBool(getEntry(info)));
}

Napi::Value TelemetryVariable::GetInt(const Napi::CallbackInfo &info)
{
  return Napi::Number::New(info.Env(), m_var->getInt(getEntry(info)));
}

Napi::Value TelemetryVariable::GetFloat(const Napi::CallbackInfo &info)
{

  return Napi::Number::New(info.Env(), m_var->getFloat(getEntry(info)));
}

Napi::Value TelemetryVariable::GetDouble(const Napi::CallbackInfo &info)
{
  return Napi::Number::New(info.Env(), m_var->getDouble(getEntry(info)));
}