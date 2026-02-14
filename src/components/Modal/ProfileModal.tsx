'use client';

import { useRouter } from "next/navigation";
import { updateProfile } from "@/app/actions";
import { useEffect, useRef, Dispatch, SetStateAction, ChangeEvent, useState, useTransition } from "react";
import Image from "next/image";
import imageCompression from 'browser-image-compression';
import { FaCamera } from "react-icons/fa";
import { useProfile, Profile } from "@/contexts/ProfileContext";


const ProfileModal = (
    { isOpenModal, setIsOpenModal }: { isOpenModal: boolean, setIsOpenModal: Dispatch<SetStateAction<boolean>> }
) => {
    const router = useRouter();

    // Contextから現在のプロフィール情報と更新関数を取得
    const { profile, setProfile } = useProfile();
    const [isPending, startTransition] = useTransition();

    // プレビューURLのstate
    const [previewUrl, setPreviewUrl] = useState<string | null>(profile?.icon || null);
    // アップロード中の状態管理
    const [isUploading, setIsUploading] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const formRef = useRef<HTMLFormElement>(null);

    // モーダル外をクリックしたときの処理
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                setIsOpenModal(false);
            }
        }

        // モーダル表示中のみイベントリスナーを追加
        if (isOpenModal) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        // クリーンアップ関数：コンポーネントがアンマウントされるか、モーダルを閉じるときにリスナーを削除
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpenModal, setIsOpenModal]);


    // モーダル表示中、背面スクロールを禁止
    useEffect(() => {
        if (isOpenModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        // コンポーネントがアンマウントされた際にもスクロールを元に戻す
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpenModal]);


    // モーダルが開かれたとき、プレビューをリセット
    useEffect(() => {
        if (isOpenModal && profile) {
            setPreviewUrl(profile.icon);
        }
    }, [isOpenModal, profile]);

    // ファイルが選択されたら、プレビューURLを更新
    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // 圧縮オプションを設定
        const options = {
            maxSizeMB: 0.5,
            maxWidthOrHeight: 416,
            useWebWorker: true, // 処理高速化
        };

        try {
            setIsUploading(true);

            const compressedFileBlob = await imageCompression(file, options);

            // BlobをFileオブジェクトに変換
            const compressedFile = new File([compressedFileBlob], file.name, {
                type: compressedFileBlob.type,
                lastModified: Date.now(),
            });

            // デバッグ
            console.log(`Original file size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
            console.log(`Compressed file size: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);

            // 圧縮後のファイルでプレビューURLを更新
            setPreviewUrl(URL.createObjectURL(compressedFile));

            // フォームに圧縮後のファイルをセット
            if (fileInputRef.current) {
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(compressedFile);
                fileInputRef.current.files = dataTransfer.files;
            }
        } catch (error) {
            console.log('Image compression error:', error);
        } finally {
            setIsUploading(false);
        }
    }

    // Server Actionを呼び出すラッパー関数
    const handleFormSubmit = (formData: FormData) => {
        startTransition(async () => {
            // Server Actionを呼び出してデータベースを更新
            const result = await updateProfile(formData) as { success: boolean; newIconUrl?: string | null; message?: string } | undefined;

            if (result?.success) {
                const newName = formData.get('userName') as string;
                const newEmail = formData.get('email') as string;
                const updatedIcon = result.newIconUrl || (profile as Profile).icon;

                setProfile(prevProfile => ({
                    ...(prevProfile as Profile),
                    name: newName,
                    email: newEmail,
                    icon: updatedIcon,
                }));
                setIsOpenModal(false);
                router.refresh();
            } else {
                console.error("Profile update failed:", result?.message);
                // Optionally show error to user
                alert(result?.message || 'Failed to update profile');
            }
        });
    };

    // profileがまだ読み込まれていない場合は何も表示しない
    if (!profile) return null;


    return (
        <>
            {isOpenModal && (
                <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50">
                    <div ref={modalRef} className="p-8 sm:p-10 bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                        <header className="w-full max-w-xl">
                            <h1 className="text-2xl font-bold text-gray-900">
                                Edit Profile
                            </h1>
                        </header>
                        <div className="mt-6">
                            <form ref={formRef} action={handleFormSubmit}>
                                <label htmlFor="icon-upload" className="cursor-pointer">
                                    <div className="relative w-24 h-24 mx-auto group">
                                        <Image
                                            src={previewUrl || "/default_icon.svg"}
                                            width={96}
                                            height={96}
                                            alt="No image"
                                            className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                                        />
                                        {/* ホバー時に表示される半透明のオーバーレイ */}
                                        <div className="absolute inset-0 rounded-full bg-black/40 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                                            <FaCamera className="text-white text-2xl opacity-0 group-hover:opacity-80 transition-opacity" />
                                        </div>

                                        {isUploading && (
                                            <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                                            </div>
                                        )}
                                    </div>
                                </label>
                                <input
                                    id="icon-upload"
                                    name="icon"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                />
                                <div className="mt-6 text-left">
                                    <label htmlFor="userName" className="block text-sm font-medium">ユーザー名</label>
                                    <input type="text" id="userName" name="userName" required defaultValue={profile.name || ''} className="block py-1.5 px-2 w-full rounded-md border-0 shadow-sm ring-1 ring-inset ring-gray-300" />
                                </div>
                                <div className="mt-6 text-left">
                                    <label htmlFor="email" className="block text-sm font-medium">メールアドレス</label>
                                    <input type="text" id="email" name="email" required defaultValue={profile.email} className="block py-1.5 px-2 w-full rounded-md border-0 shadow-sm ring-1 ring-inset ring-gray-300" />
                                </div>
                                <div className="mt-8 flex justify-center gap-4">
                                    <button
                                        type="submit"
                                        className="w-45 px-8 py-2 rounded-md text-white font-semibold bg-cyan-700 hover:bg-cyan-600"
                                        disabled={isPending}
                                    >
                                        {isPending ? 'Saving' : 'Save'}
                                    </button>
                                    <button
                                        onClick={() => setIsOpenModal(false)}
                                        className="w-45 px-8 py-2 rounded-md text-cyan-700 font-semibold border border-cyan-700 hover:bg-cyan-50"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
};

export default ProfileModal;