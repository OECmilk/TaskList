'use client';

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const DeletedTaskRedirect = ({ returnPath }: { returnPath: string }) => {
    const router = useRouter();

    useEffect(() => {
        // Redirect to returnPath immediately
        router.replace(returnPath);
        router.refresh();
    }, [router, returnPath]);

    return null; // Render nothing
};

export default DeletedTaskRedirect;
