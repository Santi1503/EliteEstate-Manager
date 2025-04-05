import { storage } from "./config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export const uploadImage = async (file, folder) => {
    const storageRef = ref(storage, `${folder}/${file.name}`)

    await uploadBytes(storageRef, file)
    const url = await getDownloadURL(storageRef)
    return url
}