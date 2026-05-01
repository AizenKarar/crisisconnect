export async function POST(request) {
    try {
        const body = await request.json();
        const lat = body.lat;
        const lon = body.lon;
        const apikey = process.env.NEXT_PUBLIC_LOCATIONIQ_API_KEY;
        const response = await fetch("https://us1.locationiq.com/v1/reverse?key=" + apikey + "&lat=" + lat + "&lon=" + lon + "&format=json");
        const data = await response.json();
        return Response.json(data);
    } catch (error) {
        return Response.json({ error: "failed" });
    }
}