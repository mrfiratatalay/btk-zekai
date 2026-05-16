using System.Text.Json;
using System.Text.Json.Serialization;

namespace ZekAI.Application.DTOs;

public record EnsureAgentSessionRequest(string AppName, string UserId);

public record AgentRunRequest(
    [property: JsonPropertyName("app_name")]
    string App_Name,
    [property: JsonPropertyName("user_id")]
    string User_Id,
    [property: JsonPropertyName("session_id")]
    string Session_Id,
    [property: JsonPropertyName("new_message")]
    JsonElement New_Message
);
