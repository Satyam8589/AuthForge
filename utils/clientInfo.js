export const getClientInfo = (req) => {
    const ipAddress = 
        req.headers['x-forwarded-for']?.split(',')[0].trim() ||
        req.headers['x-real-ip'] ||
        req.ip ||
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        'unknown';

    const userAgent = req.headers['user-agent'] || 'unknown';

    const device = parseUserAgent(userAgent);

    return {
        ipAddress: cleanIpAddress(ipAddress),
        device,
        userAgent
    };
};

const cleanIpAddress = (ip) => {
    if (ip === '::1' || ip === '::ffff:127.0.0.1') {
        return '127.0.0.1';
    }
    if (ip.startsWith('::ffff:')) {
        return ip.substring(7);
    }
    return ip;
};

const parseUserAgent = (userAgent) => {
    if (!userAgent || userAgent === 'unknown') {
        return 'Unknown Device';
    }

    let browser = 'Unknown Browser';
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
        browser = 'Chrome';
    } else if (userAgent.includes('Firefox')) {
        browser = 'Firefox';
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
        browser = 'Safari';
    } else if (userAgent.includes('Edg')) {
        browser = 'Edge';
    } else if (userAgent.includes('Opera') || userAgent.includes('OPR')) {
        browser = 'Opera';
    }

    let os = 'Unknown OS';
    if (userAgent.includes('Windows')) {
        os = 'Windows';
    } else if (userAgent.includes('Mac OS')) {
        os = 'macOS';
    } else if (userAgent.includes('Linux')) {
        os = 'Linux';
    } else if (userAgent.includes('Android')) {
        os = 'Android';
    } else if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) {
        os = 'iOS';
    }

    let deviceType = 'Desktop';
    if (userAgent.includes('Mobile')) {
        deviceType = 'Mobile';
    } else if (userAgent.includes('Tablet') || userAgent.includes('iPad')) {
        deviceType = 'Tablet';
    }

    return `${browser} on ${os} (${deviceType})`;
};

export const getLocationFromIP = async (ipAddress) => {
    if (ipAddress === '127.0.0.1' || ipAddress === 'unknown') {
        return {
            country: 'Local',
            city: 'Localhost'
        };
    }

    try {
        const response = await fetch(`https://ipapi.co/${ipAddress}/json/`);
        const data = await response.json();
        return {
            country: data.country_name,
            city: data.city,
            region: data.region
        };
    } catch (error) {
        return {
            country: 'Unknown',
            city: 'Unknown'
        };
    }
};
