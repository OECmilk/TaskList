'use client';

import { useState } from 'react';
import ProfileModal from '@/components/Modal/ProfileModal';

const EditProfileButton = () => {

    const [isOpenModal, setIsOpenModal] = useState(false);

return (
    <div>
        <button
        onClick={()=>setIsOpenModal(true)}
        className="block w-full px-4 py-2 text-sm font-medium text-white bg-cyan-700 rounded-md hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
        Edit Profile
        </button>

        <ProfileModal isOpenModal={isOpenModal} setIsOpenModal={setIsOpenModal} />
    </div>
    )
};


export default EditProfileButton;