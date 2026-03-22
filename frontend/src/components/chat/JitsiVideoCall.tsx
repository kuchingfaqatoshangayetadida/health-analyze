import React, { useEffect, useRef } from 'react';

interface JitsiVideoCallProps {
    roomName: string;
    userName: string;
    onClose: () => void;
}

declare global {
    interface Window {
        JitsiMeetExternalAPI: any;
    }
}

const JitsiVideoCall: React.FC<JitsiVideoCallProps> = ({ roomName, userName, onClose }) => {
    const jitsiContainerRef = useRef<HTMLDivElement>(null);
    const apiRef = useRef<any>(null);

    useEffect(() => {
        // Load Jitsi script if not already loaded
        const scriptId = 'jitsi-external-api-script';
        const loadJitsiScript = () => {
            return new Promise<void>((resolve) => {
                if (window.JitsiMeetExternalAPI) {
                    resolve();
                    return;
                }
                const script = document.createElement('script');
                script.id = scriptId;
                script.src = 'https://meet.jit.si/external_api.js';
                script.async = true;
                script.onload = () => resolve();
                document.body.appendChild(script);
            });
        };

        const initJitsi = async () => {
            await loadJitsiScript();

            if (jitsiContainerRef.current) {
                const domain = 'meet.jit.si';
                const options = {
                    roomName: `HealthChat_${roomName}`, // Unique prefix to avoid collision
                    width: '100%',
                    height: '100%',
                    parentNode: jitsiContainerRef.current,
                    userInfo: {
                        displayName: userName,
                    },
                    configOverwrite: {
                        disableThirdPartyRequests: true,
                        prejoinPageEnabled: true, // Foydalanuvchiga kamerani tekshirish imkonini beradi
                        enableWelcomePage: false,
                        disableDeepLinking: true,
                        disableLocalVideoFlip: false,
                    },
                    interfaceConfigOverwrite: {
                        SHOW_JITSI_WATERMARK: false,
                        GENERATE_ROOMNAMES_ON_WELCOME_PAGE: false,
                        DISPLAY_WELCOME_PAGE_CONTENT: false,
                    },
                };

                apiRef.current = new window.JitsiMeetExternalAPI(domain, options);

                // Add event listeners
                apiRef.current.addEventListeners({
                    readyToClose: () => {
                        onClose();
                    },
                    videoConferenceTerminated: () => {
                        onClose();
                    }
                });
            }
        };

        initJitsi();

        return () => {
            if (apiRef.current) {
                apiRef.current.dispose();
            }
        };
    }, [roomName, userName, onClose]);

    return (
        <div
            ref={jitsiContainerRef}
            className="w-full h-full bg-black rounded-2xl overflow-hidden shadow-2xl"
            style={{ minHeight: '450px' }}
        />
    );
};

export default JitsiVideoCall;
