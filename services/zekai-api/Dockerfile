FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ZekAI.ZekaiApi.sln .
COPY src/ZekAI.Api/ZekAI.Api.csproj src/ZekAI.Api/
COPY src/ZekAI.Application/ZekAI.Application.csproj src/ZekAI.Application/
COPY src/ZekAI.Domain/ZekAI.Domain.csproj src/ZekAI.Domain/
COPY src/ZekAI.Infrastructure/ZekAI.Infrastructure.csproj src/ZekAI.Infrastructure/

RUN dotnet restore

COPY . .
RUN dotnet publish src/ZekAI.Api/ZekAI.Api.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "ZekAI.Api.dll"]
