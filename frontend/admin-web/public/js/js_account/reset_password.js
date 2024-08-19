$(document).ready(function() {
    $('#change-password-form').submit(function(event) {
        event.preventDefault();

        var email = $('#inputEmail').val(); // 이메일 추가
        var newPassword = $('#new-password').val();
        var confirmPassword = $('#confirm-password').val();

        // 비밀번호와 확인용 비밀번호가 일치하는지 확인
        if (newPassword !== confirmPassword) {
            alert("비밀번호가 맞지 않습니다.");
            return;
        }

        // 비밀번호 변경 요청을 서버로 보냄
        $.ajax({
            type: 'POST',
            url: '/admin/resetPassword', // 서버의 비밀번호 변경 엔드포인트로 설정해야 함
            data: {
                email: email, // 이메일 추가
                newPassword: newPassword
            },
            success: function(response) {
                alert(response.message); // 서버로부터의 응답 메시지를 표시
                window.location.href = '/admin/login'; // 로그인 화면으로 리디렉션
            },
            error: function(xhr, status, error) {
                console.error('Error:', error);
                alert('비밀번호 변경에 실패했습니다. 잠시 후 다시 시도해주세요.');
            }
        });
    });
});
