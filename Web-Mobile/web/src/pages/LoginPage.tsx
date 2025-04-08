import React, { useState } from 'react';
import { login } from '../api/axiosClient';
import { useNavigate } from 'react-router-dom';
import { Box, Card, Flex, TextField, Text, Button, Link } from '@radix-ui/themes';
import { PersonIcon, LockClosedIcon } from '@radix-ui/react-icons';

function LoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');

        try {
            // const { token, user } = (await login({ email: email, password: password }));
            const user = await login(email, password);
            console.log('Logged in successfully:', { user });

            // Navigate to some protected route, e.g., /
            navigate('/');
        } catch (error: any) {
            console.error('Login error:', error);
            setErrorMessage(error?.response?.data?.message || 'Login failed');
        }
    };

    return (
        <Flex align="center" justify="center" className="bg-image" style={{ minHeight: '100vh' }}>
            <Box width="400px">
                <Card>
                    <form onSubmit={handleLogin}>
                        <Flex direction="column" p="5">
                            <Text as="div" size="7" weight="bold">Log In</Text>

                            <Flex direction="column" gap="1" pt="6">
                                <Text as="div" size="2" weight="bold">Username or Email</Text>
                                <TextField.Root value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email">
                                    <TextField.Slot>
                                        <PersonIcon height="16" width="16" />
                                    </TextField.Slot>
                                </TextField.Root>
                            </Flex>

                            <Flex direction="column" gap="1" pt="6">
                                <Flex justify="between">
                                    <Text as="div" size="2" weight="bold">Password</Text>
                                    <Link href="/forgot-password" size="2" color="blue">
                                        Forgot password?
                                    </Link>
                                </Flex>
                                <TextField.Root value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" type="password">
                                    <TextField.Slot>
                                        <LockClosedIcon height="16" width="16" />
                                    </TextField.Slot>
                                </TextField.Root>
                            </Flex>

                            {errorMessage && (
                                <Text as="p" size="2" color="red" className='pt-2'>
                                    {errorMessage}
                                </Text>
                            )}

                            <Flex gap="2" justify="end" pt="5">
                                <Button variant="outline" className='cursor-pointer!'>
                                    Log In
                                </Button>
                            </Flex>
                        </Flex>
                    </form>
                </Card>
            </Box>
        </Flex>
    );
}

export default LoginPage;