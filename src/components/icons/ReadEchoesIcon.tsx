import React from 'react';
import Image from 'next/image';

const ReadEchoesIcon = (props: { className?: string}) => (
    <Image
        src="https://res.cloudinary.com/hdi70gihi/image/upload/v1/media/static/logo120_z0qbjw"
        alt="ReadEchoes Icon"
        width={22}
        height={22}
        style={{ borderRadius: "50%" }}
        {...props}
    />
);

export default ReadEchoesIcon;