// import { dbConnection } from "@database/database";
// import { User } from "@database/database/models/user.model";
// import { Media } from "@database/models/media.model";
// import { NextResponse } from "next/server";

// export async function POST(req:any, res:any) {
//     try {
//         await dbConnection();
//         const val = await req.json();
//         const { data, urlData, email, mediaType } = val;

        
//         // Check for missing fields
//         if (!data || !urlData || !email || !mediaType) {
//             return NextResponse.json({ msg: "Incomplete info", success: false });
//         }

//         // Validate mediaType
//         if (!["video", "image", "text"].includes(mediaType)) {
//             return NextResponse.json({ msg: "Invalid mediaType", success: false });
//         }

//         // Find user by email
//         const UserId = await User.findOne({ email });
//         if (!UserId) {
//             return NextResponse.json({ msg: "User not found", success: false });
//         }

//         // Create and save media
//         const media = new Media({
//             userId: UserId._id,
//             url: urlData,
//             mediaType,
//         });

//         await media.save();
//         return NextResponse.json({ msg: "Media saved successfully", success: true, media });
//     } catch (error) {
//         console.error("Error:", error);
//         return NextResponse.json({ msg: "Error saving media", error: error, success: false });
//     }
// }
