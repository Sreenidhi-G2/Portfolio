import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import '../styles/landing3D.css';
import { Link } from 'react-router-dom';

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

const Landing3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const modelsRef = useRef<THREE.Mesh[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationIdRef = useRef<number>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);


  const [isLoaded, setIsLoaded] = useState(false);

  // Create laptop geometry
  const createLaptop = () => {
    const laptop = new THREE.Group();

    // Laptop base
    const baseGeometry = new THREE.BoxGeometry(3, 0.2, 2);
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: 0x2c3e50,
      metalness: 0.8,
      roughness: 0.2
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    laptop.add(base);

    // Laptop screen
    const screenGeometry = new THREE.BoxGeometry(2.8, 1.8, 0.1);
    const screenMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      metalness: 0.9,
      roughness: 0.1
    });
    const screen = new THREE.Mesh(screenGeometry, screenMaterial);
    screen.position.set(0, 1, -0.9);
    screen.rotation.x = -Math.PI / 6;
    laptop.add(screen);

    // Screen glow
    const glowGeometry = new THREE.BoxGeometry(2.6, 1.6, 0.05);
    const glowMaterial = new THREE.MeshStandardMaterial({
      color: 0x64ffda,
      emissive: 0x64ffda,
      emissiveIntensity: 0.3,
      transparent: true,
      opacity: 0.8
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.position.set(0, 1, -0.85);
    glow.rotation.x = -Math.PI / 6;
    laptop.add(glow);

    return laptop;
  };

  // Create mobile phone geometry
  const createMobile = () => {
    const mobile = new THREE.Group();

    // Phone body
    const bodyGeometry = new THREE.BoxGeometry(0.8, 1.6, 0.1);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x34495e,
      metalness: 0.9,
      roughness: 0.1
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    mobile.add(body);

    // Phone screen
    const screenGeometry = new THREE.BoxGeometry(0.7, 1.4, 0.05);
    const screenMaterial = new THREE.MeshStandardMaterial({
      color: 0xff6b6b,
      emissive: 0xff6b6b,
      emissiveIntensity: 0.4,
      transparent: true,
      opacity: 0.9
    });
    const screen = new THREE.Mesh(screenGeometry, screenMaterial);
    screen.position.z = 0.08;
    mobile.add(screen);

    return mobile;
  };

  // Create database geometry
  const createDatabase = () => {
    const database = new THREE.Group();

    // Database cylinders (stacked)
    for (let i = 0; i < 3; i++) {
      const cylinderGeometry = new THREE.CylinderGeometry(1, 1, 0.4, 32);
      const cylinderMaterial = new THREE.MeshStandardMaterial({
        color: 0xffd93d,
        metalness: 0.7,
        roughness: 0.3,
        emissive: 0xffd93d,
        emissiveIntensity: 0.1
      });
      const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
      cylinder.position.y = i * 0.5 - 0.5;
      database.add(cylinder);
    }

    return database;
  };

  // Create server rack geometry
  const createServer = () => {
    const server = new THREE.Group();

    // Main server body
    const serverGeometry = new THREE.BoxGeometry(2, 3, 1);
    const serverMaterial = new THREE.MeshStandardMaterial({
      color: 0x2c3e50,
      metalness: 0.8,
      roughness: 0.2
    });
    const serverBody = new THREE.Mesh(serverGeometry, serverMaterial);
    server.add(serverBody);

    // LED indicators
    for (let i = 0; i < 6; i++) {
      const ledGeometry = new THREE.SphereGeometry(0.05, 8, 8);
      const ledMaterial = new THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? 0x00ff00 : 0xff0000,
        emissive: i % 2 === 0 ? 0x00ff00 : 0xff0000,
        emissiveIntensity: 0.5
      });
      const led = new THREE.Mesh(ledGeometry, ledMaterial);
      led.position.set(-0.8, 1 - i * 0.3, 0.55);
      server.add(led);
    }

    return server;
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

    // Create Tech Models with better distribution
    const models: THREE.Mesh[] = [];

    // Laptop (top-left area)
    const laptop = createLaptop();
    laptop.position.set(-6, 3, -5);
    scene.add(laptop);
    models.push(laptop as any);

    // Mobile (top-right area)
    const mobile = createMobile();
    mobile.position.set(7, 4, -3);
    scene.add(mobile);
    models.push(mobile as any);

    // Database (bottom-left area)
    const database = createDatabase();
    database.position.set(-5, -3, -6);
    scene.add(database);
    models.push(database as any);

    // Server (bottom-right area)
    const server = createServer();
    server.position.set(6, -2, -4);
    scene.add(server);
    models.push(server as any);

    // Background wireframe sphere
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
    const particleCount = 800;
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 120;
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

    // Mouse interaction handler
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

      // Animate tech objects
      if (models[0]) { // laptop
        models[0].rotation.y += 0.008;
        models[0].position.y = 3 + Math.sin(time * 0.6) * 0.5;
        models[0].position.x = -6 + Math.cos(time * 0.4) * 0.3;
      }

      if (models[1]) { // mobile
        models[1].rotation.z += 0.01;
        models[1].rotation.y += 0.015;
        models[1].position.y = 4 + Math.cos(time * 0.8) * 0.6;
        models[1].position.x = 7 + Math.sin(time * 0.5) * 0.4;
      }

      if (models[2]) { // database
        models[2].rotation.y += 0.012;
        models[2].position.y = -3 + Math.sin(time * 1.2) * 0.4;
        models[2].position.x = -5 + Math.cos(time * 0.7) * 0.3;
      }

      if (models[3]) { // server
        models[3].rotation.y += 0.006;
        models[3].position.y = -2 + Math.cos(time * 0.9) * 0.5;
        models[3].position.x = 6 + Math.sin(time * 0.6) * 0.3;
      }

      if (models[4]) { // wireframe sphere
        models[4].rotation.x += 0.002;
        models[4].rotation.y += 0.003;
      }

      // Smoother mouse interaction
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

    // Handle window resize
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;

      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Start animation
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

      // Dispose of Three.js objects
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

  const handleRoleTagHover = (index: number, isHovering: boolean) => {
    const models = modelsRef.current;
    const modelIndex = index % (models.length - 1); // Exclude wireframe sphere
    if (models[modelIndex]) {
      models[modelIndex].traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          const material = child.material as THREE.MeshStandardMaterial;
          if (material.emissive) {
            material.emissiveIntensity = isHovering ? 0.4 : 0.1;
          }
        }
      });
    }
  };

  const scrollToProjects = () => {
    console.log('Scrolling to projects...');
  };

  const scrollToContact = () => {
    console.log('Scrolling to contact...');
  };

  const roleTagsData = {
    'Full Stack Developer': {
      'Backend': [
        { name: 'Node.js', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg' },
        { name: 'Express', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg' },
        { name: 'Django', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/django/django-plain.svg' },
        { name: 'FastAPI', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/fastapi/fastapi-original.svg' },
        { name: 'Go', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original.svg' },
        { name: 'PostgreSQL', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg' },
        { name: 'MongoDB', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg' }
      ],
      'Frontend': [
        { name: 'React', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg' },
        { name: 'TypeScript', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg' },
        { name: 'Tailwind', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg' },

      ],
      'Tools': [
        { name: 'Git', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg' },
        { name: 'Docker', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg' },
        { name: 'AWS', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg' },
        { name: 'Postman', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postman/postman-original.svg' }
      ]
    },
    'DevOps': {
      'Infrastructure': [
        { name: 'AWS', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg' },
        { name: 'Azure', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/azure/azure-original.svg' },
        { name: 'GCP', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/googlecloud/googlecloud-original.svg' },

      ],
      'Containerization': [
        { name: 'Docker', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg' },
        { name: 'Kubernetes', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-plain.svg' },

      ],
      'CI/CD': [

        { name: 'GitHub Actions', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg' },
        { name: 'GitLab CI', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/gitlab/gitlab-original.svg' }
      ]

    },
    'DSA': {
      'Languages': [
        { name: 'C++', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg' },
        { name: 'Python', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg' },
        { name: 'Java', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg' }
      ],
      'Topics': [
        { name: 'Arrays', logo: 'https://img.icons8.com/fluency/96/000000/code.png' },
        { name: 'Trees', logo: 'https://img.icons8.com/fluency/96/000000/binary-tree.png' },
        { name: 'Graphs', logo: 'https://img.icons8.com/fluency/96/000000/graph.png' },
        { name: 'Dynamic Programming', logo: 'https://img.icons8.com/fluency/96/000000/algorithm.png' }
      ],
      'Platforms': [
        { name: 'LeetCode', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/leetcode.svg' },
        { name: 'Codeforces', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/codeforces.svg' },
        { name: 'CodeChef', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/codechef.svg' }
      ]
    },
    'Techie': {
      'Interests': [
        { name: 'AI/ML', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tensorflow/tensorflow-original.svg' },

        { name: 'Cloud Computing', logo: 'https://img.icons8.com/fluency/96/000000/cloud.png' }
      ],
      'Learning': [
        { name: 'System Design', logo: 'https://img.icons8.com/fluency/96/000000/system-task.png' },
        { name: 'Microservices', logo: 'https://img.icons8.com/fluency/96/000000/api-settings.png' },
        { name: 'WebSockets', logo: 'https://img.icons8.com/fluency/96/000000/connection-sync.png' }
      ],
      'Hobbies': [
        { name: 'Open Source', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg' },
        { name: 'Tech Blogs', logo: 'https://img.icons8.com/fluency/96/000000/blog.png' },
        { name: 'Hackathons', logo: 'https://img.icons8.com/fluency/96/000000/trophy.png' }
      ]
    }
  };

  const developerErrors = [
    { error: "404: Coffee Not Found ☕", type: "backend" as const },
    { error: "TypeError: Cannot read property 'sanity' of developer", type: "frontend" as const },
    { error: "500: Internal Server Scream", type: "backend" as const },
    { error: "ReferenceError: sleep is not defined", type: "frontend" as const },
    { error: "git push --force (sent to production)", type: "general" as const },
    { error: "npm ERR! peer dep missing: social-life@1.0.0", type: "general" as const },
    { error: "CORS policy: 'Why can't we just be friends?'", type: "backend" as const },
    { error: "Uncaught Promise: 'I'll fix it tomorrow'", type: "frontend" as const },
    { error: "Memory leak: developer.brain.retain(coffee)", type: "general" as const },
    { error: "SSL certificate expired (like my motivation)", type: "backend" as const },
    { error: "Hydration failed: Plants need water, not code", type: "frontend" as const },
    { error: "Connection timeout: WiFi or patience?", type: "backend" as const },
    { error: "useEffect missing dependency: [sanity]", type: "frontend" as const },
    { error: "Database deadlock: It's thinking... still thinking", type: "backend" as const },
    { error: "console.log('Why does this work now?')", type: "general" as const },
    { error: "Stack overflow: Questions about questions", type: "general" as const },
    { error: "React key prop missing: Like my car keys", type: "frontend" as const },
    { error: "Segmentation fault: Brain.exe has stopped", type: "backend" as const },
    { error: "Infinite loop detected: Monday.repeat()", type: "general" as const },
    { error: "Permission denied: sudo make me a sandwich", type: "backend" as const }
  ];

  return (
    <div style={{
      fontFamily: "'Inter', sans-serif",
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #2d1b69 100%)',
      height: '100vh',
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

      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 5,
        pointerEvents: 'none'
      }}>
        {/* Distributed floating elements */}
        <FloatingElement top="15%" left="8%" />
        <FloatingElement top="25%" right="12%" delay={-1} />
        <FloatingElement top="45%" left="15%" delay={-2} />
        <FloatingElement top="35%" right="20%" delay={-3} />
        <FloatingElement top="65%" left="75%" delay={-1.5} />
        <FloatingElement top="75%" right="70%" delay={-2.5} />
        <FloatingElement top="55%" left="85%" delay={-0.5} />
        <FloatingElement top="85%" left="25%" delay={-3.5} />

        {/* Developer Errors floating around - better distributed */}
        {developerErrors.map((errorObj, index) => (
          <FloatingError
            key={`${errorObj.error}-${index}`}
            error={errorObj.error}
            type={errorObj.type}
            top={`${10 + (index * 4) % 80}%`}
            left={index % 3 === 0 ? `${5 + (index * 3) % 25}%` : undefined}
            right={index % 3 === 1 ? `${5 + (index * 2) % 25}%` : undefined}
            delay={-Math.random() * 12}
          />
        ))}
      </div>

      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        pointerEvents: 'none',
        background: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.1) 70%)'
      }}>
        <div style={{
          maxWidth: '800px',
          padding: '2rem',
          animation: 'fadeInUp 1.5s ease-out'
        }}>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: 300,
            color: '#64ffda',
            marginBottom: '1rem',
            opacity: 0,
            animation: 'fadeIn 2s ease-out 0.5s forwards'
          }}>
            Hello Devs! 👋
          </div>

          <h1 style={{
            fontSize: 'clamp(3rem, 8vw, 6rem)',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #64ffda 0%, #ff6b6b 50%, #ffd93d 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '1.5rem',
            lineHeight: 1.1,
            opacity: 0,
            animation: 'fadeIn 2s ease-out 1s forwards'
          }}>
            I'm Sreenidhi
          </h1>

          <p style={{
            fontSize: '1.8rem',
            fontWeight: 400,
            color: '#ffffff',
            marginBottom: '2rem',
            opacity: 0,
            animation: 'fadeIn 2s ease-out 1.5s forwards'
          }}>
            MERN-ing My Way Through Life
          </p>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '1rem',
            marginBottom: '3rem',
            opacity: 0,
            animation: 'fadeIn 2s ease-out 2s forwards'
          }}>
            {Object.keys(roleTagsData).map((role, index) => (
              <span
                key={role}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'rgba(100, 255, 218, 0.1)',
                  border: '1px solid rgba(100, 255, 218, 0.3)',
                  borderRadius: '50px',
                  color: '#64ffda',
                  fontWeight: 500,
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease',
                  pointerEvents: 'auto',
                  cursor: 'pointer'
                }}
                onClick={() => setSelectedRole(role)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.borderColor = '#64ffda';
                  handleRoleTagHover(index, true);
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.borderColor = 'rgba(100, 255, 218, 0.3)';
                  handleRoleTagHover(index, false);
                }}
              >
                {role}
              </span>
            ))}
          </div>



          <div style={{
            display: 'flex',
            gap: '2rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
            opacity: 0,
            animation: 'fadeIn 2s ease-out 2.5s forwards'
          }}>

            <Link to='/projects'>
              <button

                style={{
                  padding: '1rem 2.5rem',
                  background: 'linear-gradient(135deg, #ff6b6b, #ffd93d)',
                  color: '#000',
                  border: 'none',
                  borderRadius: '50px',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  pointerEvents: 'auto',
                  boxShadow: '0 10px 30px rgba(255, 107, 107, 0.3)',
                  fontFamily: "'Inter', sans-serif"
                }}
                onClick={scrollToProjects}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 15px 40px rgba(255, 107, 107, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(255, 107, 107, 0.3)';
                }}
              >
                View My Work
              </button>
            </Link>
            <Link to='/contact'>
              <button
                style={{
                  padding: '1rem 2.5rem',
                  background: 'transparent',
                  color: '#64ffda',
                  border: '2px solid #64ffda',
                  borderRadius: '50px',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  pointerEvents: 'auto',
                  backdropFilter: 'blur(10px)',
                  fontFamily: "'Inter', sans-serif"
                }}
                onClick={scrollToContact}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#64ffda';
                  e.currentTarget.style.color = '#0f0f23';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#64ffda';
                }}
              >
                Get In Touch
              </button>
            </Link>
          </div>
        </div>
      </div>


      {/* Tech Stack Modal - MOVED HERE */}
      {selectedRole && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 100,
            animation: 'fadeIn 0.3s ease-out',
            pointerEvents: 'auto'
          }}
          onClick={() => setSelectedRole(null)}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(26, 26, 62, 0.95), rgba(45, 27, 105, 0.95))',
              border: '2px solid rgba(100, 255, 218, 0.3)',
              borderRadius: '20px',
              padding: '2.5rem',
              maxWidth: '600px',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
              animation: 'fadeInUp 0.4s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2rem'
            }}>
              <h2 style={{
                fontSize: '2rem',
                fontWeight: 700,
                color: '#64ffda',
                margin: 0
              }}>
                {selectedRole}
              </h2>
              <button
                onClick={() => setSelectedRole(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#ff6b6b',
                  fontSize: '2rem',
                  cursor: 'pointer',
                  padding: '0',
                  lineHeight: 1,
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                ×
              </button>
            </div>

            {Object.entries(roleTagsData[selectedRole as keyof typeof roleTagsData]).map(([category, techs]) => (
              <div key={category} style={{ marginBottom: '1.5rem' }}>
                <h3 style={{
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  color: '#ffd93d',
                  marginBottom: '0.75rem'
                }}>
                  {category}
                </h3>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.75rem'
                }}>
                  {techs.map((tech) => (
                    <span
                      key={tech.name}
                      style={{
                        padding: '0.6rem 1.2rem',
                        background: 'rgba(255, 107, 107, 0.1)',
                        border: '1px solid rgba(255, 107, 107, 0.3)',
                        borderRadius: '20px',
                        color: '#ffffff',
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 107, 107, 0.2)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 5px 15px rgba(255, 107, 107, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 107, 107, 0.1)';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <img
                        src={tech.logo}
                        alt={tech.name}
                        style={{
                          width: '24px',
                          height: '24px',
                          objectFit: 'contain',
                          filter: tech.name === 'Express' || tech.name === 'Next.js' || tech.name === 'GitHub Actions' || tech.name === 'LeetCode' || tech.name === 'Codeforces' || tech.name === 'CodeChef' || tech.name === 'Open Source' ? 'invert(1)' : 'none'
                        }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      {tech.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}






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
            Loading Experience...
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

export default Landing3D;