export const formatDate = (timestamp) => {
    if (!timestamp) return '';

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

export const formatSalary = (min, max) => {
    if (!min && !max) {
        return 'Salary not specified';
    }
    if (!max) {
        return `Rs. ${min.toLocaleString()} +`;
    }
    if (!min) {
        return `Rs. ${min.toLocaleString()}`;
    }
    return `Rs. ${min.toLocaleString()} - Rs. ${max.toLocaleString()}`;
}

export const truncateText = (text, maxLength = 150) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export const validateURL = (url) => {
    try {
        new URL(url);
        return true;
    } catch (error) {
        return false;
    }
};

export const generateSlug = (title) => {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}