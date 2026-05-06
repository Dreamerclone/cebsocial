import { supabase } from './supabase';

export const uploadImage = async (file, bucket = 'post-images') => {
    try {
        // --- IMAGE COMPRESSION LOGIC ---
        const compressImage = (imgFile) => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.readAsDataURL(imgFile);
                reader.onload = (event) => {
                    const img = new Image();
                    img.src = event.target.result;
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        const MAX_WIDTH = 1200;
                        const scaleSize = MAX_WIDTH / img.width;
                        canvas.width = MAX_WIDTH;
                        canvas.height = img.height * scaleSize;

                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                        canvas.toBlob((blob) => {
                            resolve(new File([blob], imgFile.name, { type: 'image/jpeg' }));
                        }, 'image/jpeg', 0.7);
                    };
                };
            });
        };

        const compressedFile = await compressImage(file);

        const fileExt = compressedFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        let { error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(filePath, compressedFile);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);

        return data.publicUrl;
    } catch (error) {
        console.error('Error uploading image:', error.message);
        return null;
    }
};

export const calculateDistance = (userCoords, targetCoords) => {
    if (!userCoords || !targetCoords) return null;
    const R = 6371; // Earth's radius in km
    const dLat = (targetCoords.lat - userCoords.lat) * Math.PI / 180;
    const dLng = (targetCoords.lng - userCoords.lng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(userCoords.lat * Math.PI / 180) * Math.cos(targetCoords.lat * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
};

export const generateInitials = (name) => {
    if (!name || typeof name !== 'string') return '??';
    const nameParts = name.trim().split(' ');
    if (nameParts.length > 1 && nameParts[0] && nameParts[nameParts.length - 1]) {
      return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase() || '??';
};

export const formatTimeAgo = (date) => {
    if (!date) return 'Some time ago';
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now - past) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return past.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

export const cleanText = (text) => {
    if (!text) return '';
    // Basic filter for toxic keywords (can be expanded)
    const badWords = ['pisting', 'atay', 'yawa', 'piste', 'boang', 'gago', 'putangina'];
    let cleaned = text;
    let isToxic = false;

    badWords.forEach(word => {
        const regex = new RegExp(word, 'gi');
        if (regex.test(text)) {
            isToxic = true;
            cleaned = cleaned.replace(regex, '***');
        }
    });

    return { cleaned, isToxic };
};
