import { useState, useEffect, useRef } from 'react';
import { socket } from './chat-hook';
import { useAuth } from './auth-context';

export interface CallData {
    signal: any;
    from: string;
    callerName: string;
    callerAvatar: string;
}

export const useVideoCall = () => {
    const { user } = useAuth();

    const [stream, setStream] = useState<MediaStream | null>(null);
    const [callData, setCallData] = useState<CallData | null>(null);
    const [callAccepted, setCallAccepted] = useState(false);
    const [callEnded, setCallEnded] = useState(false);
    const [recevingCall, setRecevingCall] = useState(false);
    const [outgoingCall, setOutgoingCall] = useState(false);
    const [peerStatus, setPeerStatus] = useState<'idle' | 'calling' | 'connected'>('idle');

    const myVideo = useRef<HTMLVideoElement>(null);
    const userVideo = useRef<HTMLVideoElement>(null);
    const connectionRef = useRef<RTCPeerConnection | null>(null);
    const pendingCandidates = useRef<RTCIceCandidateInit[]>([]);

    useEffect(() => {
        if (!user) return;

        // Initialize user's personal room
        socket.emit('join_personal_room', { userId: user.id });

        // Listen for incoming call
        socket.on('call_user', (data: CallData) => {
            setRecevingCall(true);
            setCallData(data);
        });

        // Listen for when the recipient answers
        socket.on('call_accepted', async (signal) => {
            setCallAccepted(true);
            setOutgoingCall(false);
            setPeerStatus('connected');
            if (connectionRef.current) {
                try {
                    await connectionRef.current.setRemoteDescription(new RTCSessionDescription(signal));
                    pendingCandidates.current.forEach(candidate => {
                        connectionRef.current?.addIceCandidate(new RTCIceCandidate(candidate)).catch(console.error);
                    });
                    pendingCandidates.current = [];
                } catch (e) {
                    console.error("Error setting remote description from call_accepted", e);
                }
            }
        });

        // Listen for new ICE candidates
        socket.on('ice_candidate', (candidate) => {
            if (connectionRef.current) {
                if (connectionRef.current.remoteDescription && connectionRef.current.remoteDescription.type) {
                    connectionRef.current.addIceCandidate(new RTCIceCandidate(candidate)).catch(e => console.error('Error adding received ice candidate', e));
                } else {
                    pendingCandidates.current.push(candidate);
                }
            }
        });

        // Listen for call ended by peer
        socket.on('call_ended', () => {
            leaveCall();
        });

        return () => {
            socket.off('call_user');
            socket.off('call_accepted');
            socket.off('ice_candidate');
            socket.off('call_ended');
        };
    }, [user]);

    // Setup local media stream
    const setupStream = async () => {
        try {
            const currentStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setStream(currentStream);
            if (myVideo.current) {
                myVideo.current.srcObject = currentStream;
            }
            return currentStream;
        } catch (err) {
            console.error('Error accessing media devices.', err);
            return null;
        }
    };

    const callUser = async (idToCall: string) => {
        if (!user) return;
        setOutgoingCall(true);
        setPeerStatus('calling');

        const currentStream = stream || await setupStream();
        if (!currentStream) return;

        const peer = new RTCPeerConnection({
            iceServers: [
                { urls: "stun:stun.l.google.com:19302" },
                { urls: "stun:global.stun.twilio.com:3478" }
            ]
        });
        connectionRef.current = peer;

        // Add local stream tracks to peer connection
        currentStream.getTracks().forEach((track) => {
            peer.addTrack(track, currentStream);
        });

        // Listen for remote tracks
        peer.ontrack = (event) => {
            if (userVideo.current) {
                userVideo.current.srcObject = event.streams[0];
            }
        };

        // When ICE candidates are found, send them to the peer
        peer.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('ice_candidate', {
                    to: idToCall,
                    candidate: event.candidate
                });
            }
        };

        // Create an offer to connect
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);

        socket.emit('call_user', {
            userToCall: idToCall,
            signalData: offer,
            from: user.id,
            callerName: user.name,
            callerAvatar: user.avatar
        });
    };

    const answerCall = async () => {
        setCallAccepted(true);
        setRecevingCall(false);
        setPeerStatus('connected');

        const currentStream = stream || await setupStream();
        if (!currentStream || !callData) return;

        const peer = new RTCPeerConnection({
            iceServers: [
                { urls: "stun:stun.l.google.com:19302" },
                { urls: "stun:global.stun.twilio.com:3478" }
            ]
        });
        connectionRef.current = peer;

        // Add local stream tracks to peer connection
        currentStream.getTracks().forEach((track) => {
            peer.addTrack(track, currentStream);
        });

        // Listen for remote tracks
        peer.ontrack = (event) => {
            if (userVideo.current) {
                userVideo.current.srcObject = event.streams[0];
            }
        };

        // Send ICE candidate to peer
        peer.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('ice_candidate', {
                    to: callData.from,
                    candidate: event.candidate
                });
            }
        };

        // Receive the caller's offer
        try {
            await peer.setRemoteDescription(new RTCSessionDescription(callData.signal));
            pendingCandidates.current.forEach(candidate => {
                peer.addIceCandidate(new RTCIceCandidate(candidate)).catch(console.error);
            });
            pendingCandidates.current = [];
        } catch (e) {
            console.error("Error setting remote description from offer", e);
        }

        // Create an answer and send it back
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);

        socket.emit('answer_call', {
            signal: answer,
            to: callData.from
        });
    };

    const rejectCall = () => {
        socket.emit('end_call', { to: callData?.from });
        setRecevingCall(false);
        setCallData(null);
    };

    const leaveCall = () => {
        setCallEnded(true);
        setCallAccepted(false);
        setRecevingCall(false);
        setOutgoingCall(false);
        setPeerStatus('idle');

        if (connectionRef.current) {
            connectionRef.current.close();
            connectionRef.current = null;
        }

        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }

        if (callData && callAccepted) {
            socket.emit('end_call', { to: callData.from });
        }

        pendingCandidates.current = [];
        setCallData(null);
    };

    return {
        stream,
        myVideo,
        userVideo,
        callAccepted,
        callEnded,
        recevingCall, // Typos kept backward compatible
        outgoingCall,
        callData,
        callUser,
        answerCall,
        rejectCall,
        leaveCall,
        peerStatus,
        setupStream
    };
};
