import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Mail, Github, Linkedin, Copy, Check, Download } from 'lucide-react';


interface FloatingElementProps {
  top: string;
  left?: string;
  right?: string;
  delay?: number;
}

interface FloatingErrorProps {
  error: string;
  type: 'frontend' | 'backend' | 'general';
  top: string;
  left?: string;
  right?: string;
  delay?: number;
}

const FloatingElement: React.FC<FloatingElementProps> = ({ top, left, right, delay = 0 }) => (
  <div
    className="floating-element"
    style={{
      top,
      left,
      right,
      animationDelay: `${delay}s`
    }}
  />
);

const FloatingError: React.FC<FloatingErrorProps> = ({ error, type, top, left, right, delay = 0 }) => (
  <div
    className={`floating-error floating-error-${type}`}
    style={{
      top,
      left,
      right,
      animationDelay: `${delay}s`
    }}
  >
    {error}
  </div>
);

const ContactPage: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const modelsRef = useRef<THREE.Mesh[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationIdRef = useRef<number>(null);

  const [isLoaded, setIsLoaded] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);

  // Create communication-themed geometries
  const createEmail = () => {
    const email = new THREE.Group();

    // Email envelope
    const envelopeGeometry = new THREE.BoxGeometry(3, 2, 0.1);
    const envelopeMaterial = new THREE.MeshStandardMaterial({
      color: 0x3498db,
      metalness: 0.8,
      roughness: 0.2
    });
    const envelope = new THREE.Mesh(envelopeGeometry, envelopeMaterial);
    email.add(envelope);

    // Email glow
    const glowGeometry = new THREE.BoxGeometry(2.8, 1.8, 0.05);
    const glowMaterial = new THREE.MeshStandardMaterial({
      color: 0x64ffda,
      emissive: 0x64ffda,
      emissiveIntensity: 0.3,
      transparent: true,
      opacity: 0.8
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.position.z = 0.1;
    email.add(glow);

    return email;
  };

  const createPhone = () => {
    const phone = new THREE.Group();

    // Phone body
    const bodyGeometry = new THREE.BoxGeometry(0.8, 1.6, 0.1);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x2c3e50,
      metalness: 0.9,
      roughness: 0.1
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    phone.add(body);

    // Screen with message bubble
    const screenGeometry = new THREE.BoxGeometry(0.7, 1.4, 0.05);
    const screenMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      metalness: 0.9,
      roughness: 0.1
    });
    const screen = new THREE.Mesh(screenGeometry, screenMaterial);
    screen.position.z = 0.08;
    phone.add(screen);

    // Message bubble
    const bubbleGeometry = new THREE.SphereGeometry(0.2, 16, 16);
    const bubbleMaterial = new THREE.MeshStandardMaterial({
      color: 0xff6b6b,
      emissive: 0xff6b6b,
      emissiveIntensity: 0.4
    });
    const bubble = new THREE.Mesh(bubbleGeometry, bubbleMaterial);
    bubble.position.set(0.1, 0.2, 0.15);
    phone.add(bubble);

    return phone;
  };

  const createNetwork = () => {
    const network = new THREE.Group();

    // Central hub
    const hubGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const hubMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd93d,
      emissive: 0xffd93d,
      emissiveIntensity: 0.3,
      metalness: 0.7,
      roughness: 0.3
    });
    const hub = new THREE.Mesh(hubGeometry, hubMaterial);
    network.add(hub);

    // Connection nodes
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const x = Math.cos(angle) * 2;
      const y = Math.sin(angle) * 2;

      const nodeGeometry = new THREE.SphereGeometry(0.2, 8, 8);
      const nodeMaterial = new THREE.MeshStandardMaterial({
        color: 0x64ffda,
        emissive: 0x64ffda,
        emissiveIntensity: 0.5
      });
      const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
      node.position.set(x, y, 0);
      network.add(node);

      // Connection lines
      const lineGeometry = new THREE.CylinderGeometry(0.02, 0.02, 2, 8);
      const lineMaterial = new THREE.MeshStandardMaterial({
        color: 0x9c27b0,
        emissive: 0x9c27b0,
        emissiveIntensity: 0.2
      });
      const line = new THREE.Mesh(lineGeometry, lineMaterial);
      line.position.set(x / 2, y / 2, 0);
      line.rotation.z = angle + Math.PI / 2;
      network.add(line);
    }

    return network;
  };

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    // Store references
    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const pointLight1 = new THREE.PointLight(0x64ffda, 1, 100);
    pointLight1.position.set(10, 10, 10);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff6b6b, 1, 100);
    pointLight2.position.set(-10, -10, 10);
    scene.add(pointLight2);

    // Create Communication Models
    const models: THREE.Mesh[] = [];

    // Email (top-left)
    const email = createEmail();
    email.position.set(-6, 4, -5);
    scene.add(email);
    models.push(email as any);

    // Phone (top-right)
    const phone = createPhone();
    phone.position.set(7, 3, -4);
    scene.add(phone);
    models.push(phone as any);

    // Network (bottom)
    const network = createNetwork();
    network.position.set(0, -4, -6);
    scene.add(network);
    models.push(network as any);

    // Background wireframe
    const wireframeGeometry = new THREE.SphereGeometry(8, 32, 32);
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0x9c27b0,
      wireframe: true,
      transparent: true,
      opacity: 0.1
    });
    const wireframeSphere = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
    wireframeSphere.position.set(0, 0, -15);
    scene.add(wireframeSphere);
    models.push(wireframeSphere);

    modelsRef.current = models;

    // Particle System
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 600;
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 100;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particleMaterial = new THREE.PointsMaterial({
      color: 0x64ffda,
      size: 0.1,
      transparent: true,
      opacity: 0.4
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    camera.position.z = 12;

    // Mouse interaction
    const handleMouseMove = (event: MouseEvent) => {
      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    document.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    const animate = () => {
      if (!sceneRef.current || !rendererRef.current || !cameraRef.current) return;

      const time = Date.now() * 0.001;
      const models = modelsRef.current;

      // Animate communication objects
      if (models[0]) { // email
        models[0].rotation.y += 0.008;
        models[0].position.y = 4 + Math.sin(time * 0.6) * 0.5;
      }

      if (models[1]) { // phone
        models[1].rotation.z += 0.01;
        models[1].position.y = 3 + Math.cos(time * 0.8) * 0.6;
      }

      if (models[2]) { // network
        models[2].rotation.y += 0.012;
        models[2].position.y = -4 + Math.sin(time * 1.2) * 0.4;
      }

      if (models[3]) { // wireframe
        models[3].rotation.x += 0.002;
        models[3].rotation.y += 0.003;
      }

      // Mouse interaction
      const camera = cameraRef.current;
      const mouse = mouseRef.current;
      const targetX = mouse.x * 1.5;
      const targetY = mouse.y * 1.5;

      camera.position.x += (targetX - camera.position.x) * 0.03;
      camera.position.y += (targetY - camera.position.y) * 0.03;
      camera.lookAt(scene.position);

      // Particle animation
      particles.rotation.y += 0.0008;
      particles.rotation.x += 0.0005;

      rendererRef.current.render(sceneRef.current, camera);
      animationIdRef.current = requestAnimationFrame(animate);
    };

    // Handle resize
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;

      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    animate();
    setIsLoaded(true);

    // Cleanup
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);

      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }

      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }

      modelsRef.current.forEach(model => {
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach(mat => mat.dispose());
              } else {
                child.material.dispose();
              }
            }
          }
        });
      });

      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, []);

  const copyEmailToClipboard = async () => {
    try {
      await navigator.clipboard.writeText('sreenidhig2005@gmail.com');
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy email: ', err);
    }
  };

  const contactErrors = [
    { error: "Connection established: Human detected", type: "backend" as const },
    { error: "POST /contact: 200 OK (Let's talk!)", type: "backend" as const },
    { error: "Email.send() - Promise resolved successfully", type: "frontend" as const },
    { error: "LinkedIn handshake: Professional mode activated", type: "general" as const },
    { error: "GitHub star: You're awesome repository", type: "general" as const },
    { error: "Network timeout: My social skills loading...", type: "backend" as const },
    { error: "Contact form validation: All fields look great!", type: "frontend" as const },
    { error: "SMTP server: Ready to receive your message", type: "backend" as const },
    { error: "Coffee.meet(you) - Function not yet defined", type: "general" as const },
    { error: "Response time: Faster than my code compilation", type: "general" as const },
    { error: "SSL handshake: Secure conversation initiated", type: "backend" as const },
    { error: "useState: [reply, setReply] - State updated!", type: "frontend" as const }
  ];

  return (
    <div style={{
      fontFamily: "'Inter', sans-serif",
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #2d1b69 100%)',
      minHeight: '100vh',
      position: 'relative',
      width: '100%'
    }}>
      <div ref={mountRef} style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1
      }} />

      {/* Floating Elements */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 5,
        pointerEvents: 'none'
      }}>
        <FloatingElement top="10%" left="5%" />
        <FloatingElement top="20%" right="8%" delay={-1} />
        <FloatingElement top="40%" left="12%" delay={-2} />
        <FloatingElement top="60%" right="15%" delay={-3} />
        <FloatingElement top="80%" left="20%" delay={-1.5} />

        {/* Contact-themed floating errors */}
        {contactErrors.map((errorObj, index) => (
          <FloatingError
            key={`${errorObj.error}-${index}`}
            error={errorObj.error}
            type={errorObj.type}
            top={`${15 + (index * 6) % 70}%`}
            left={index % 3 === 0 ? `${5 + (index * 4) % 25}%` : undefined}
            right={index % 3 === 1 ? `${5 + (index * 3) % 25}%` : undefined}
            delay={-Math.random() * 10}
          />
        ))}
      </div>

      {/* Main Content */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem',
        background: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.1) 70%)'
      }}>
        <div style={{
          maxWidth: '800px',
          width: '100%',
          textAlign: 'center'
        }}>
          {/* Contact Info Section */}
          <div style={{
            opacity: 0,
            animation: 'fadeIn 2s ease-out 0.5s forwards'
          }}>
            <h1 style={{
              fontSize: 'clamp(2.5rem, 6vw, 4rem)',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #64ffda 0%, #ff6b6b 50%, #ffd93d 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: '1.5rem',
              lineHeight: 1.1
            }}>
              Let's Connect!
            </h1>

            <p style={{
              fontSize: '1.2rem',
              color: '#ffffff',
              marginBottom: '3rem',
              opacity: 0.9,
              maxWidth: '600px',
              margin: '0 auto 3rem auto'
            }}>
              Ready to collaborate? Connect with me through these platforms.
            </p>

            {/* Contact Links */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              maxWidth: '500px',
              margin: '0 auto'
            }}>
              <button
                onClick={copyEmailToClipboard}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem 1.5rem',
                  background: 'rgba(100, 255, 218, 0.1)',
                  border: '1px solid rgba(100, 255, 218, 0.3)',
                  borderRadius: '15px',
                  color: '#64ffda',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)',
                  cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '1rem',
                  width: '100%',
                  justifyContent: 'flex-start'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(100, 255, 218, 0.2)';
                  e.currentTarget.style.transform = 'translateX(10px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(100, 255, 218, 0.1)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <Mail size={24} />
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontWeight: 600 }}>Email</div>
                  <div style={{ opacity: 0.8, fontSize: '0.9rem' }}>sreenidhig2005@gmail.com</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {emailCopied ? <Check size={20} /> : <Copy size={20} />}
                  <span style={{ fontSize: '0.8rem' }}>
                    {emailCopied ? 'Copied!' : 'Click to copy'}
                  </span>
                </div>
              </button>

              {/* Resume Download Button */}
              <a
                href="/Sreenidhi_resume.pdf" // Make sure this matches your resume file name in public folder
                download="Sreenidhi_resume.pdf"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem 1.5rem',
                  background: 'rgba(156, 39, 176, 0.1)',
                  border: '1px solid rgba(156, 39, 176, 0.3)',
                  borderRadius: '15px',
                  color: '#9c27b0',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)',
                  cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '1rem',
                  width: '100%',
                  justifyContent: 'flex-start'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(156, 39, 176, 0.2)';
                  e.currentTarget.style.transform = 'translateX(10px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(156, 39, 176, 0.1)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <Download size={24} />
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontWeight: 600 }}>Resume</div>
                  <div style={{ opacity: 0.8, fontSize: '0.9rem' }}>Download my resume</div>
                </div>
              </a>

              <a
                href="https://www.linkedin.com/in/sreenidhi-g-4537382a4/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem 1.5rem',
                  background: 'rgba(255, 107, 107, 0.1)',
                  border: '1px solid rgba(255, 107, 107, 0.3)',
                  borderRadius: '15px',
                  color: '#ff6b6b',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 107, 107, 0.2)';
                  e.currentTarget.style.transform = 'translateX(10px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 107, 107, 0.1)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <Linkedin size={24} />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 600 }}>LinkedIn</div>
                  <div style={{ opacity: 0.8, fontSize: '0.9rem' }}>Professional Network</div>
                </div>
              </a>

              <a
                href="https://github.com/Sreenidhi-G2"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem 1.5rem',
                  background: 'rgba(255, 217, 61, 0.1)',
                  border: '1px solid rgba(255, 217, 61, 0.3)',
                  borderRadius: '15px',
                  color: '#ffd93d',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 217, 61, 0.2)';
                  e.currentTarget.style.transform = 'translateX(10px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 217, 61, 0.1)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <Github size={24} />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 600 }}>GitHub</div>
                  <div style={{ opacity: 0.8, fontSize: '0.9rem' }}>Code Repository</div>
                </div>
              </a>

              <a
                href="https://leetcode.com/u/Sreenidhi2005/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem 1.5rem',
                  background: 'rgba(255, 161, 30, 0.1)',
                  border: '1px solid rgba(255, 161, 30, 0.3)',
                  borderRadius: '15px',
                  color: '#ffa11e',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 161, 30, 0.2)';
                  e.currentTarget.style.transform = 'translateX(10px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 161, 30, 0.1)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M13.38 5.37a.75.75 0 0 0-1.06 0L8.27 8.47a.75.75 0 0 0 1.06 1.06l2.5-2.5 2.5 2.5a.75.75 0 0 0 1.06-1.06l-2.5-2.5z"
                    fill="currentColor"
                  />
                  <path
                    d="M11.5 13.5a.75.75 0 0 1 1.06 0l2.5 2.5a.75.75 0 0 1-1.06 1.06l-2.5-2.5a.75.75 0 0 1 0-1.06z"
                    fill="currentColor"
                  />
                  <path
                    d="M20.66 15.47a.75.75 0 0 0-1.06 0l-1.6 1.6a2.25 2.25 0 0 1-3.18 0l-3-3a2.25 2.25 0 0 1 0-3.18l1.6-1.6a.75.75 0 0 0-1.06-1.06l-1.6 1.6a3.75 3.75 0 0 0 0 5.3l3 3a3.75 3.75 0 0 0 5.3 0l1.6-1.6a.75.75 0 0 0 0-1.06z"
                    fill="currentColor"
                  />
                  <path
                    d="M7.56 8.53a.75.75 0 0 1 1.06 0l1.6 1.6a2.25 2.25 0 0 1 0 3.18l-3 3a2.25 2.25 0 0 1-3.18 0l-1.6-1.6a.75.75 0 0 1 1.06-1.06l1.6 1.6a.75.75 0 0 0 1.06 0l3-3a.75.75 0 0 0 0-1.06l-1.6-1.6a.75.75 0 0 1 0-1.06z"
                    fill="currentColor"
                  />
                </svg>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 600 }}>LeetCode</div>
                  <div style={{ opacity: 0.8, fontSize: '0.9rem' }}>Algorithm Challenges</div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Loading overlay */}
      {!isLoaded && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: '#0f0f23',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 20
        }}>
          <div style={{
            color: '#64ffda',
            fontSize: '1.5rem',
            fontWeight: 500
          }}>
            Establishing Connection...
          </div>
        </div>
      )}

      <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
          
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(50px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
    </div>
  );
};

export default ContactPage;