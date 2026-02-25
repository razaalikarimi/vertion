# ================================
# BUILD STAGE
# ================================
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY . .
RUN dotnet restore Veriton.API/Veriton.API.csproj
RUN dotnet publish Veriton.API/Veriton.API.csproj \
    -c Release \
    -o /app/publish \
    /p:UseAppHost=false

# ================================
# RUNTIME STAGE
# ================================
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

EXPOSE 8080

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "Veriton.API.dll"]
